import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LiveSession } from './live-session.entity';
import { LiveUser } from './live-user.entity';

@Entity({ name: 'live_gift' })
export class LiveGift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LiveSession, (session) => session.gifts, {
    onDelete: 'CASCADE',
  })
  session: LiveSession;

  @ManyToOne(() => LiveUser, (user) => user.gifts, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: LiveUser | null;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  hostUsername: string | null;

  @Column({ type: 'varchar' })
  giftName: string;

  @Column({ type: 'bigint' })
  giftId: number;

  @Column({ type: 'bigint' })
  coinValue: number;

  @Column({ type: 'int', default: 1 })
  count: number;

  @Column({ type: 'timestamp with time zone' })
  sentAt: Date;
}
