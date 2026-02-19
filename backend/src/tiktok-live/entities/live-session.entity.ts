import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { LiveChatMessage } from './live-chat-message.entity';

@Entity({ name: 'live_session' })
export class LiveSession {
  @PrimaryColumn({ type: 'varchar' })
  id: string; // roomId from TikTok

  @Column({ type: 'varchar' })
  hostUsername: string;

  @Column({ type: 'timestamp with time zone' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endedAt: Date | null;

  @OneToMany(() => LiveChatMessage, (message) => message.session)
  messages: LiveChatMessage[];
}
