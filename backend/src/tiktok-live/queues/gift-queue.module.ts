import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftQueueProcessor } from './gift-queue.processor';
import { LiveSession } from '../entities/live-session.entity';
import { LiveUser } from '../entities/live-user.entity';
import { LiveGift } from '../entities/live-gift.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'gift-messages',
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
    TypeOrmModule.forFeature([LiveSession, LiveUser, LiveGift]),
  ],
  providers: [GiftQueueProcessor],
  exports: [BullModule],
})
export class GiftQueueModule {}
