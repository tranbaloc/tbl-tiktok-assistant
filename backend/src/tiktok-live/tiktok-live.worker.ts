import { Logger } from '@nestjs/common';
import {
  ControlEvent,
  TikTokLiveConnection,
  WebcastEvent,
} from 'tiktok-live-connector';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type Redis from 'ioredis';
import type { Repository } from 'typeorm';
import type { TikTokLiveConnectionState } from 'tiktok-live-connector/dist/types/events';
import type { WebcastChatMessage } from 'tiktok-live-connector/dist/types/tiktok-schema';
import { LiveSession } from './entities/live-session.entity';
import { LiveUser } from './entities/live-user.entity';
import { LiveChatMessage } from './entities/live-chat-message.entity';
import { LiveChannel } from './entities/live-channel.entity';
import type { ChatMessageJobData } from './queues/chat-queue.processor';

export type TiktokWorkerStatus = {
  username: string;
  isConnected: boolean;
  roomId: string | null;
};

const RETRY_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export class TiktokLiveWorker {
  private readonly logger: Logger;
  private readonly connection: TikTokLiveConnection;

  private isConnected = false;
  private roomId: string | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private shouldRetry = true;
  private handlersRegistered = false;

  constructor(
    private readonly username: string,
    private readonly sessionRepo: Repository<LiveSession>,
    private readonly userRepo: Repository<LiveUser>,
    private readonly chatRepo: Repository<LiveChatMessage>,
    private readonly redis: Redis,
    private readonly channelRepo: Repository<LiveChannel>,
    private readonly channelId: string,
    @InjectQueue('chat-messages')
    private readonly chatQueue: Queue<ChatMessageJobData>,
    parentLogger: Logger,
  ) {
    this.logger = parentLogger;
    this.connection = new TikTokLiveConnection(`@${username}`);
  }

  getStatus(): TiktokWorkerStatus {
    return {
      username: this.username,
      isConnected: this.isConnected,
      roomId: this.roomId,
    };
  }

  async ensureRunningWithRetry(): Promise<void> {
    this.shouldRetry = true;
    if (!this.handlersRegistered) {
      this.registerEventHandlers();
      this.handlersRegistered = true;
    }
    await this.tryConnectOnce();
  }

  private async tryConnectOnce(): Promise<void> {
    if (!this.shouldRetry) {
      return;
    }

    // If already connected, don't try again
    if (this.isConnected) {
      this.logger.log(`[${this.username}] already connected, skipping retry`);
      return;
    }

    try {
      const isLive = await this.connection.fetchIsLive();
      if (!isLive) {
        this.logger.log(
          `[${this.username}] not live yet, scheduling retry in 5 minutes`,
        );
        await this.updateChannelStatus('waiting_retry', null, null);
        this.scheduleRetry();
        return;
      }

      // Ensure handlers are registered before connecting
      if (!this.handlersRegistered) {
        this.registerEventHandlers();
        this.handlersRegistered = true;
      }

      // connect() will emit CONNECTED event, which will trigger onConnected() via handler
      await this.connection.connect();
    } catch (error) {
      this.logger.warn(
        `[${this.username}] connection attempt failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.updateChannelStatus('waiting_retry', null, null);
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    if (!this.shouldRetry) {
      return;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(() => {
      void this.tryConnectOnce();
    }, RETRY_INTERVAL_MS);

    this.logger.log(
      `[${this.username}] retry scheduled in ${RETRY_INTERVAL_MS / 1000 / 60} minutes`,
    );
  }

  async stop(): Promise<void> {
    this.shouldRetry = false;

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    try {
      await this.connection.disconnect();
    } finally {
      if (this.roomId) {
        await this.handleSessionDisconnected(this.roomId);
      }
      this.isConnected = false;
      this.roomId = null;
      this.handlersRegistered = false;
    }
  }

  private registerEventHandlers() {
    this.connection.on(ControlEvent.CONNECTED, (state) => {
      void this.onConnected(state);
    });

    this.connection.on(ControlEvent.DISCONNECTED, () => {
      void this.onDisconnected();
    });

    this.connection.on(WebcastEvent.CHAT, (msg) => {
      void this.onChat(msg);
    });
  }

  private async onConnected(state: TikTokLiveConnectionState) {
    this.isConnected = true;
    this.roomId = state.roomId ?? this.safeRoomId();
    this.logger.log(
      `[${this.username}] connected (roomId=${this.roomId ?? 'unknown'})`,
    );

    await this.updateChannelStatus('connected', new Date(), null);

    if (this.roomId) {
      await this.handleSessionConnected(this.roomId);
    }
  }

  private async onDisconnected() {
    this.isConnected = false;
    this.logger.warn(`[${this.username}] disconnected`);

    await this.updateChannelStatus('disconnected', null, new Date());

    if (this.roomId) {
      await this.handleSessionDisconnected(this.roomId);
      this.roomId = null;
    }

    if (this.shouldRetry) {
      this.scheduleRetry();
    }
  }

  private async updateChannelStatus(
    status: string,
    connectedAt: Date | null,
    disconnectedAt: Date | null,
  ): Promise<void> {
    try {
      const channel = await this.channelRepo.findOne({
        where: { id: this.channelId },
      });
      if (channel) {
        channel.lastStatus = status;
        if (connectedAt !== null) {
          channel.lastConnectedAt = connectedAt;
        }
        if (disconnectedAt !== null) {
          channel.lastDisconnectedAt = disconnectedAt;
        }
        await this.channelRepo.save(channel);
      }
    } catch (error) {
      this.logger.warn(
        `[${this.username}] failed to update channel status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async onChat(msg: WebcastChatMessage) {
    const roomId = this.roomId ?? this.safeRoomId();
    if (!roomId) {
      this.logger.warn(
        `[${this.username}] CHAT without roomId; skipped persist`,
      );
      return;
    }

    const uniqueId = msg.user?.uniqueId;
    const userId = uniqueId ?? 'unknown';
    const message = msg.comment ?? '';

    // Log immediately for monitoring
    this.logger.log(`[${this.username}] COMMENT from ${userId}: ${message}`);

    // Add to queue for async processing
    try {
      await this.chatQueue.add(
        'process-chat-message',
        {
          roomId,
          username: this.username,
          userUniqueId: uniqueId,
          userNickname: msg.user?.nickname,
          userAvatarUrl: msg.user?.profilePicture?.url?.[0],
          message,
          sentAt: new Date(),
        },
        {
          priority: 1, // Normal priority
          removeOnComplete: true,
        },
      );
    } catch (error) {
      this.logger.error(
        `[${this.username}] Failed to add chat message to queue: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async handleSessionConnected(roomId: string) {
    let session = await this.sessionRepo.findOne({ where: { id: roomId } });

    if (!session) {
      session = this.sessionRepo.create({
        id: roomId,
        hostUsername: this.username,
        startedAt: new Date(),
        endedAt: null,
      });
    } else if (session.endedAt) {
      // If roomId gets reused, treat as a new session by resetting times
      session.startedAt = new Date();
      session.endedAt = null;
      session.hostUsername = this.username;
    }

    await this.sessionRepo.save(session);

    await this.redis.set(
      `live:session:${roomId}`,
      JSON.stringify({
        roomId,
        hostUsername: session.hostUsername,
        startedAt: session.startedAt.toISOString(),
      }),
    );
  }

  private async handleSessionDisconnected(roomId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: roomId } });
    if (session) {
      session.endedAt = new Date();
      await this.sessionRepo.save(session);
    }

    await this.redis.del(`live:session:${roomId}`);
  }

  private safeRoomId(): string | null {
    try {
      return this.connection.roomId ?? null;
    } catch {
      return null;
    }
  }
}
