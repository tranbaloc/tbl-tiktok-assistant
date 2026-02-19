import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSession } from '../entities/live-session.entity';
import { LiveUser } from '../entities/live-user.entity';
import { LiveChatMessage } from '../entities/live-chat-message.entity';

export interface ChatMessageJobData {
  roomId: string;
  username: string;
  userUniqueId?: string;
  userNickname?: string;
  userAvatarUrl?: string;
  message: string;
  sentAt: Date;
}

@Processor('chat-messages')
export class ChatQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ChatQueueProcessor.name);

  constructor(
    @InjectRepository(LiveSession)
    private readonly sessionRepo: Repository<LiveSession>,
    @InjectRepository(LiveUser)
    private readonly userRepo: Repository<LiveUser>,
    @InjectRepository(LiveChatMessage)
    private readonly chatRepo: Repository<LiveChatMessage>,
  ) {
    super();
  }

  async process(job: Job<ChatMessageJobData>): Promise<void> {
    const { roomId, username, userUniqueId, userNickname, userAvatarUrl, message, sentAt } = job.data;

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

      // Create and save chat message
      const chat = this.chatRepo.create({
        session,
        user,
        message,
        sentAt,
      });

      await this.chatRepo.save(chat);

      this.logger.debug(
        `[${username}] Processed chat message from ${userUniqueId ?? 'unknown'}: ${message.substring(0, 50)}...`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process chat message job ${job.id}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to retry job
    }
  }
}
