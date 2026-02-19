import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatQueueProcessor } from './chat-queue.processor';
import { LiveSession } from '../entities/live-session.entity';
import { LiveUser } from '../entities/live-user.entity';
import { LiveChatMessage } from '../entities/live-chat-message.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'chat-messages',
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    }),
    TypeOrmModule.forFeature([LiveSession, LiveUser, LiveChatMessage]),
  ],
  providers: [ChatQueueProcessor],
  exports: [BullModule],
})
export class ChatQueueModule {}
