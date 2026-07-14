import { Test, TestingModule } from '@nestjs/testing';
import { AiPredictionService } from './ai-prediction.service';

describe('AiPredictionService', () => {
  let service: AiPredictionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiPredictionService],
    }).compile();

    service = module.get<AiPredictionService>(AiPredictionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
