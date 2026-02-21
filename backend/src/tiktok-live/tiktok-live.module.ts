import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokLiveManagerService } from './tiktok-live.service';
import { TiktokLiveController } from './tiktok-live.controller';
import { LiveSession } from './entities/live-session.entity';
import { LiveUser } from './entities/live-user.entity';
import { LiveChatMessage } from './entities/live-chat-message.entity';
import { LiveChannel } from './entities/live-channel.entity';
import { LiveGift } from './entities/live-gift.entity';
import { RedisModule } from '../redis/redis.module';
import { ChatQueueModule } from './queues/chat-queue.module';
import { GiftQueueModule } from './queues/gift-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveSession,
      LiveUser,
      LiveChatMessage,
      LiveChannel,
      LiveGift,
    ]),
    RedisModule,
    ChatQueueModule,
    GiftQueueModule,
  ],
  providers: [TiktokLiveManagerService],
  controllers: [TiktokLiveController],
  exports: [ChatQueueModule, GiftQueueModule],
})
export class TiktokLiveModule {}
