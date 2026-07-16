import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';
import { Pledge } from '../../payments/entities/pledge.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';
import { IsOptional } from 'class-validator';

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
  id!: string;

  @IsOptional()
  @Column({ type: 'varchar', length: 255 })
  title?: string;

  @IsOptional()
  @Column({ type: 'text' })
  description?: string;

  @IsOptional()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  targetAmount?: number;

  @IsOptional()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  raisedAmount?: number;

  @IsOptional()
  @Column({ type: 'int' })
  durationDays?: number;

  @IsOptional()
  @Column({ type: 'int' })
  trlLevel?: number;

  @IsOptional()
  @Column({ type: 'boolean', default: false })
  hasVideo?: boolean;

  @IsOptional()
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  descriptionLength?: number;

  @IsOptional()
  @Column({ type: 'float', nullable: true })
  aiSuccessProbability?: number;

  @IsOptional()
  @Column({ type: 'float', nullable: true })
  aiFeasibilityIndex?: number;

  @IsOptional()
  @Column({ type: 'simple-array', nullable: true })
  aiRecommendations?: string[];
  
  @IsOptional()
  @Column({ type: 'simple-array', nullable: true })
  documentUrls?: string[];

  @IsOptional()
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status?: ProjectStatus;

  @ManyToOne(() => User, (user) => user.projects)
  creator!: User;

  @IsOptional()
  @OneToMany(() => Reward, (reward) => reward.project, { cascade: true })
  rewards?: Reward[];

  @IsOptional()
  @OneToMany(() => Pledge, (pledge) => pledge.project)
  pledges?: Pledge[];

  @IsOptional()
  @OneToOne(() => Prediction, (prediction) => prediction.project, { cascade: true })
  prediction?: Prediction;

  @IsOptional()
  @CreateDateColumn()
  createdAt?: Date;

  @IsOptional()
  @UpdateDateColumn()
  updatedAt?: Date;
}
