import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Reward } from './entities/reward.entity';
import { AiPredictionModule } from '../ai-prediction/ai-prediction.module';
import { ManticoreModule } from '../manticore/manticore.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Reward]),
    AiPredictionModule,
    ManticoreModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
