import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Reward } from '../../projects/entities/reward.entity';

export enum PledgeStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('pledges')
export class Pledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PledgeStatus, default: PledgeStatus.PENDING })
  status: PledgeStatus;

  @Column({ type: 'varchar', nullable: true })
  transactionId: string;

  @Column({ type: 'varchar', nullable: true })
  paypalOrderId: string;

  @ManyToOne(() => Project, (project) => project.pledges, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => User, (user) => user.pledges, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Reward, (reward) => reward.pledges, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  reward: Reward;

  @CreateDateColumn()
  createdAt: Date;
}
