import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { Project } from '../projects/entities/project.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { AiPredictionService, AiPredictionRequest } from '../ai-prediction/ai-prediction.service';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    private readonly aiPredictionService: AiPredictionService,
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async evaluateProject(projectId: string, user: User): Promise<Prediction> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: { creator: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.creator.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to evaluate this project');
    }

    // Preparar el payload mapeando los datos del proyecto
    const payload: AiPredictionRequest = {
      targetAmount: Number(project.targetAmount),
      durationDays: project.durationDays,
      trlLevel: project.trlLevel,
      hasVideo: project.description.includes('<video>') || project.description.includes('youtube.com'), // Lógica simple simulada
      category: 'Technology', // Asumido o extraído del proyecto si estuviera implementado
      descriptionLength: project.description.length,
    };

    // Llamar al microservicio de Inteligencia Artificial (lanzará error si 503 u otro)
    const aiResponseData = await this.aiPredictionService.predict(payload);

    let prediction = await this.predictionRepository.findOne({
      where: { project: { id: projectId } },
    });
    
    if (prediction) {
      prediction = this.predictionRepository.merge(prediction, aiResponseData);
    } else {
      prediction = this.predictionRepository.create({
        project,
        successProbability: aiResponseData.successProbability,
        feasibilityIndex: aiResponseData.feasibilityIndex,
        transparencyIndex: aiResponseData.transparencyIndex,
        recommendations: aiResponseData.recommendations,
      });
    }

    return await this.predictionRepository.save(prediction);
  }
}
