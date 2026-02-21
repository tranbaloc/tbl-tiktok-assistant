import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LiveSession } from '../tiktok-live/entities/live-session.entity';
import { LiveUser } from '../tiktok-live/entities/live-user.entity';
import { LiveChatMessage } from '../tiktok-live/entities/live-chat-message.entity';
import { LiveChannel } from '../tiktok-live/entities/live-channel.entity';
import { LiveGift } from '../tiktok-live/entities/live-gift.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'TBLTiktok'),
        entities: [LiveSession, LiveUser, LiveChatMessage, LiveChannel, LiveGift],
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
