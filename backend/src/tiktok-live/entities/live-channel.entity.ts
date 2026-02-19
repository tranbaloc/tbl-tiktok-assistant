import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'live_channel' })
export class LiveChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: false })
  isAlwaysActive: boolean; // Auto-start on app boot and auto-retry

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiredDate: Date | null; // If set and passed, auto-disable channel

  @Column({ type: 'varchar', nullable: true })
  lastStatus: string | null; // 'never_connected' | 'waiting_retry' | 'connected' | 'disconnected'

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastConnectedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastDisconnectedAt: Date | null;
}
