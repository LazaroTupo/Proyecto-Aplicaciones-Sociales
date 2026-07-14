import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';
import { Pledge } from '../../payments/entities/pledge.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';

export enum ProjectStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  FUNDING = 'funding',
  FUNDED = 'funded',
  CLOSED = 'closed',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  raisedAmount: number;

  @Column({ type: 'int' })
  durationDays: number;

  @Column({ type: 'int' })
  trlLevel: number;

  @Column({ type: 'boolean', default: false })
  hasVideo: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'int', nullable: true })
  descriptionLength: number;

  @Column({ type: 'float', nullable: true })
  aiSuccessProbability: number;

  @Column({ type: 'float', nullable: true })
  aiFeasibilityIndex: number;

  @Column({ type: 'simple-array', nullable: true })
  aiRecommendations: string[];

  @Column({ type: 'simple-array', nullable: true })
  documentUrls: string[];

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @ManyToOne(() => User, (user) => user.projects)
  creator: User;

  @OneToMany(() => Reward, (reward) => reward.project, { cascade: true })
  rewards: Reward[];

  @OneToMany(() => Pledge, (pledge) => pledge.project)
  pledges: Pledge[];

  @OneToOne(() => Prediction, (prediction) => prediction.project, { cascade: true })
  prediction: Prediction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
