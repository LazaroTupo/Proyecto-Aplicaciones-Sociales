import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Project, (project) => project.prediction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  project: Project;

  @Column({ type: 'float', nullable: true })
  successProbability: number;

  @Column({ type: 'float', nullable: true })
  feasibilityIndex: number;

  @Column({ type: 'float', nullable: true })
  transparencyIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[];

  @CreateDateColumn()
  createdAt: Date;
}
