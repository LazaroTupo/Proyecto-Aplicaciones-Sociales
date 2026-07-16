import { Injectable, Logger, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';

export interface AiPredictionRequest {
  targetAmount: number;
  durationDays: number;
  trlLevel: number;
  hasVideo: boolean;
  category: string;
  descriptionLength: number;
}

export interface AiPredictionResponse {
  successProbability: number;
  feasibilityIndex: number;
  transparencyIndex: number;
  recommendations: string[];
}

@Injectable()
export class AiPredictionService {
  private readonly logger = new Logger(AiPredictionService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async predict(payload: AiPredictionRequest): Promise<AiPredictionResponse> {
    try {
      this.logger.log(`Sending prediction request to AI microservice...`);
      const aiUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://213.210.20.7:8000/api/predict';
      const { data } = await firstValueFrom(
        this.httpService.post<AiPredictionResponse>(aiUrl, payload).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Error from AI microservice: ${error.message}`);
            
            if (error.response?.status === 503) {
              throw new ServiceUnavailableException('El modelo de Inteligencia Artificial aún no está entrenado o no se encuentra disponible (HTTP 503).');
            }
            
            throw new InternalServerErrorException('Error al conectar con el microservicio de IA.');
          }),
        ),
      );
      
      return data;
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(`Unexpected error: ${error}`);
      throw new InternalServerErrorException('Ocurrió un error inesperado al procesar la predicción.');
    }
  }
}
