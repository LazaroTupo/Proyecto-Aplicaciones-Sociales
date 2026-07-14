import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { Prediction } from './entities/prediction.entity';
import { Project } from '../projects/entities/project.entity';
import { AiPredictionModule } from '../ai-prediction/ai-prediction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prediction, Project]),
    AiPredictionModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService]
})
export class PredictionsModule {}
