import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LiveSession } from './live-session.entity';
import { LiveUser } from './live-user.entity';

@Entity({ name: 'live_chat_message' })
export class LiveChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LiveSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: LiveSession;

  @ManyToOne(() => LiveUser, (user) => user.messages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: LiveUser | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp with time zone' })
  sentAt: Date;
}
