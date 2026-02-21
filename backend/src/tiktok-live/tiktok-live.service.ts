import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { REDIS_CLIENT } from '../redis/redis.constants';
import type Redis from 'ioredis';
import { Repository } from 'typeorm';
import { DEFAULT_TIKTOK_USERNAME } from './tiktok.constants';
import { LiveChatMessage } from './entities/live-chat-message.entity';
import { LiveSession } from './entities/live-session.entity';
import { LiveUser } from './entities/live-user.entity';
import { LiveChannel } from './entities/live-channel.entity';
import { LiveGift } from './entities/live-gift.entity';
import {
  TiktokLiveWorker,
  type TiktokWorkerStatus,
} from './tiktok-live.worker';
import type { ChatMessageJobData } from './queues/chat-queue.processor';
import type { GiftJobData } from './queues/gift-queue.processor';

@Injectable()
export class TiktokLiveManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TiktokLiveManagerService.name);

  private readonly workers = new Map<string, TiktokLiveWorker>();

  constructor(
    @InjectRepository(LiveSession)
    private readonly sessionRepo: Repository<LiveSession>,
    @InjectRepository(LiveUser)
    private readonly userRepo: Repository<LiveUser>,
    @InjectRepository(LiveChatMessage)
    private readonly chatRepo: Repository<LiveChatMessage>,
    @InjectRepository(LiveChannel)
    private readonly channelRepo: Repository<LiveChannel>,
    @InjectRepository(LiveGift)
    private readonly giftRepo: Repository<LiveGift>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectQueue('chat-messages')
    private readonly chatQueue: Queue<ChatMessageJobData>,
    @InjectQueue('gift-messages')
    private readonly giftQueue: Queue<GiftJobData>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultChannels();
    await this.checkAndDisableExpiredChannels();
    await this.backfillHostUsername();
    await this.bootstrapChannels();
  }

  async onModuleDestroy() {
    const stops = [...this.workers.values()].map((w) => w.stop());
    await Promise.allSettled(stops);
    this.workers.clear();
  }

  private async seedDefaultChannels() {
    const channels = await this.channelRepo.find();
    if (channels.length === 0) {
      const defaultChannels = [
        {
          username: 'khaanhcute05',
          enabled: true,
          isAlwaysActive: true,
          lastStatus: 'never_connected',
          expiredDate: null,
        },
        {
          username: 'phamhuynhdanthu',
          enabled: true,
          isAlwaysActive: true,
          lastStatus: 'never_connected',
          expiredDate: null,
        },
      ];

      for (const channelData of defaultChannels) {
        const channel = this.channelRepo.create(channelData);
        await this.channelRepo.save(channel);
        this.logger.log(`Seeded default channel: ${channelData.username}`);
      }
    }
  }

  private async checkAndDisableExpiredChannels(): Promise<void> {
    const now = new Date();
    const expiredChannels = await this.channelRepo.find({
      where: { enabled: true },
    });

    for (const channel of expiredChannels) {
      const expiredDate = channel.expiredDate as Date | null;
      if (expiredDate && expiredDate < now) {
        channel.enabled = false;
        await this.channelRepo.save(channel);
        this.logger.log(
          `Auto-disabled expired channel: ${channel.username} (expired: ${expiredDate.toISOString()})`,
        );
      }
    }
  }

  private async bootstrapChannels() {
    const now = new Date();
    const channels = await this.channelRepo.find({
      where: { enabled: true, isAlwaysActive: true },
    });

    let bootstrappedCount = 0;

    for (const channel of channels) {
      // Skip expired channels
      const expiredDate = channel.expiredDate as Date | null;
      if (expiredDate && expiredDate < now) {
        this.logger.log(
          `Skipping expired channel: ${channel.username} (expired: ${expiredDate.toISOString()})`,
        );
        continue;
      }

      const normalized = this.normalizeUsername(channel.username);
      if (this.workers.has(normalized)) {
        continue;
      }

      const worker = new TiktokLiveWorker(
        normalized,
        this.sessionRepo,
        this.userRepo,
        this.chatRepo,
        this.redis,
        this.channelRepo,
        channel.id,
        this.chatQueue,
        this.giftQueue,
        this.logger,
      );

      this.workers.set(normalized, worker);
      void worker.ensureRunningWithRetry();
      bootstrappedCount++;
    }

    this.logger.log(
      `Bootstrapped ${bootstrappedCount} always-active channel(s) with auto-retry`,
    );
  }

  async connect(username?: string): Promise<TiktokWorkerStatus> {
    const normalized = this.normalizeUsername(
      username ?? DEFAULT_TIKTOK_USERNAME,
    );

    const existing = this.workers.get(normalized);
    if (existing) {
      return existing.getStatus();
    }

    let channel = await this.channelRepo.findOne({
      where: { username: normalized },
    });

    if (!channel) {
      channel = this.channelRepo.create({
        username: normalized,
        enabled: true,
        isAlwaysActive: false,
        lastStatus: 'never_connected',
        expiredDate: null,
      });
      channel = await this.channelRepo.save(channel);
    }

    // Check if channel is expired
    const expiredDate = channel.expiredDate as Date | null;
    if (expiredDate && expiredDate < new Date()) {
      if (channel.enabled) {
        channel.enabled = false;
        await this.channelRepo.save(channel);
      }
      throw new Error(
        `Channel ${normalized} has expired (expiredDate: ${expiredDate.toISOString()})`,
      );
    }

    // Check if channel is enabled
    if (!channel.enabled) {
      throw new Error(`Channel ${normalized} is disabled`);
    }

    const worker = new TiktokLiveWorker(
      normalized,
      this.sessionRepo,
      this.userRepo,
      this.chatRepo,
      this.redis,
      this.channelRepo,
      channel.id,
      this.chatQueue,
      this.giftQueue,
      this.logger,
    );

    this.workers.set(normalized, worker);

    try {
      await worker.ensureRunningWithRetry();
      return worker.getStatus();
    } catch (error) {
      this.workers.delete(normalized);
      throw error;
    }
  }

  async disconnect(username: string): Promise<{
    username: string;
    disconnected: boolean;
  }> {
    const normalized = this.normalizeUsername(username);

    const worker = this.workers.get(normalized);
    if (!worker) {
      return { username: normalized, disconnected: false };
    }

    await worker.stop();
    this.workers.delete(normalized);
    return { username: normalized, disconnected: true };
  }

  listConnections(): TiktokWorkerStatus[] {
    return [...this.workers.values()].map((w) => w.getStatus());
  }

  getStatus() {
    return {
      defaultUsername: DEFAULT_TIKTOK_USERNAME,
      connections: this.listConnections(),
    };
  }

  async getSessions(): Promise<LiveSession[]> {
    return this.sessionRepo.find({
      order: { startedAt: 'DESC' },
    });
  }

  async getSessionChats(sessionId: string): Promise<LiveChatMessage[]> {
    return this.chatRepo.find({
      where: { session: { id: sessionId } },
      relations: ['user'],
      order: { sentAt: 'ASC' },
    });
  }

  async getChannels(): Promise<LiveChannel[]> {
    return this.channelRepo.find({
      order: { username: 'ASC' },
    });
  }

  async getSessionGifts(sessionId: string): Promise<LiveGift[]> {
    return this.giftRepo.find({
      where: { session: { id: sessionId } },
      relations: ['user'],
      order: { sentAt: 'ASC' },
    });
  }

  async getGifts(): Promise<LiveGift[]> {
    return this.giftRepo.find({
      relations: ['session', 'user'],
      order: { sentAt: 'DESC' },
    });
  }

  async getChatsByHostUsername(hostUsername: string): Promise<LiveChatMessage[]> {
    return this.chatRepo.find({
      where: { hostUsername },
      relations: ['user'],
      order: { sentAt: 'ASC' },
    });
  }

  async getGiftsByHostUsername(hostUsername: string): Promise<LiveGift[]> {
    return this.giftRepo.find({
      where: { hostUsername },
      relations: ['user'],
      order: { sentAt: 'ASC' },
    });
  }

  private async backfillHostUsername(): Promise<void> {
    try {
      // Backfill hostUsername for chat messages
      const chatMessagesWithoutHost = await this.chatRepo
        .createQueryBuilder('chat')
        .leftJoin('chat.session', 'session')
        .where('chat.hostUsername IS NULL')
        .getMany();

      if (chatMessagesWithoutHost.length > 0) {
        this.logger.log(
          `Backfilling hostUsername for ${chatMessagesWithoutHost.length} chat messages`,
        );
        for (const chat of chatMessagesWithoutHost) {
          if (chat.session) {
            chat.hostUsername = chat.session.hostUsername;
            await this.chatRepo.save(chat);
          }
        }
        this.logger.log('Completed backfilling hostUsername for chat messages');
      }

      // Backfill hostUsername for gifts
      const giftsWithoutHost = await this.giftRepo
        .createQueryBuilder('gift')
        .leftJoin('gift.session', 'session')
        .where('gift.hostUsername IS NULL')
        .getMany();

      if (giftsWithoutHost.length > 0) {
        this.logger.log(
          `Backfilling hostUsername for ${giftsWithoutHost.length} gifts`,
        );
        for (const gift of giftsWithoutHost) {
          if (gift.session) {
            gift.hostUsername = gift.session.hostUsername;
            await this.giftRepo.save(gift);
          }
        }
        this.logger.log('Completed backfilling hostUsername for gifts');
      }
    } catch (error) {
      this.logger.warn(
        `Failed to backfill hostUsername: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Don't throw - allow app to continue even if backfill fails
    }
  }

  private normalizeUsername(username: string): string {
    return username.trim().replace(/^@/, '');
  }
}
