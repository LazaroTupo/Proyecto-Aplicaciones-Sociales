import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Project } from './project.entity';
import { Pledge } from '../../payments/entities/pledge.entity';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.rewards, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @OneToMany(() => Pledge, (pledge) => pledge.reward)
  pledges: Pledge[];
}
