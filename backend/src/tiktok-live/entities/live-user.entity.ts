import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LiveChatMessage } from './live-chat-message.entity';
import { LiveGift } from './live-gift.entity';

@Entity({ name: 'live_user' })
@Unique(['uniqueId'])
export class LiveUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  uniqueId: string;

  @Column({ type: 'varchar', nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @OneToMany(() => LiveChatMessage, (message) => message.user)
  messages: LiveChatMessage[];

  @OneToMany(() => LiveGift, (gift) => gift.user)
  gifts: LiveGift[];
}
