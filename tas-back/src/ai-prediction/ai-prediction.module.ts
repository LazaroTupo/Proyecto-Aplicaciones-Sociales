import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiPredictionService } from './ai-prediction.service';

@Module({
  imports: [HttpModule],
  providers: [AiPredictionService],
  exports: [AiPredictionService]
})
export class AiPredictionModule {}
