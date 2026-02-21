import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSession } from '../entities/live-session.entity';
import { LiveUser } from '../entities/live-user.entity';
import { LiveGift } from '../entities/live-gift.entity';

export interface GiftJobData {
  roomId: string;
  username: string;
  userUniqueId?: string;
  userNickname?: string;
  userAvatarUrl?: string;
  giftName: string;
  giftId: number;
  coinValue: number;
  count: number;
  sentAt: Date;
}

@Processor('gift-messages')
export class GiftQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(GiftQueueProcessor.name);

  constructor(
    @InjectRepository(LiveSession)
    private readonly sessionRepo: Repository<LiveSession>,
    @InjectRepository(LiveUser)
    private readonly userRepo: Repository<LiveUser>,
    @InjectRepository(LiveGift)
    private readonly giftRepo: Repository<LiveGift>,
  ) {
    super();
  }

  async process(job: Job<GiftJobData>): Promise<void> {
    const {
      roomId,
      username,
      userUniqueId,
      userNickname,
      userAvatarUrl,
      giftName,
      giftId,
      coinValue,
      count,
      sentAt,
    } = job.data;

    try {
      // Ensure session exists
      let session = await this.sessionRepo.findOne({ where: { id: roomId } });
      if (!session) {
        session = this.sessionRepo.create({
          id: roomId,
          hostUsername: username,
          startedAt: sentAt,
          endedAt: null,
        });
        await this.sessionRepo.save(session);
      }

      // Upsert user
      let user: LiveUser | null = null;
      if (userUniqueId) {
        user = await this.userRepo.findOne({ where: { uniqueId: userUniqueId } });

        if (!user) {
          user = this.userRepo.create({
            uniqueId: userUniqueId,
            nickname: userNickname ?? null,
            avatarUrl: userAvatarUrl ?? null,
          });
        } else {
          if (userNickname !== undefined) {
            user.nickname = userNickname;
          }
          if (userAvatarUrl !== undefined) {
            user.avatarUrl = userAvatarUrl;
          }
        }

        user = await this.userRepo.save(user);
      }

      // Create and save gift
      const gift = this.giftRepo.create({
        session,
        user,
        hostUsername: session.hostUsername,
        giftName,
        giftId,
        coinValue,
        count,
        sentAt,
      });

      await this.giftRepo.save(gift);
    } catch (error) {
      this.logger.error(
        `[${username}][GIFT] Failed to process gift job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to retry job
    }
  }
}
