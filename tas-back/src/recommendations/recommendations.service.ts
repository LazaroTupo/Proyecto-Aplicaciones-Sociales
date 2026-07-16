import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Interaction, InteractionType } from './entities/interaction.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { FeedQueryDto } from './dto/feed-query.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async getFeedForUser(userId: string, query: FeedQueryDto): Promise<Project[]> {
    const interactions = await this.interactionRepository.find({
      where: { userId },
      relations: { project: { creator: true } },
    });

    const queryBuilder = this.projectRepository.createQueryBuilder('project');
    queryBuilder.leftJoinAndSelect('project.creator', 'creator');
    queryBuilder.where('project.status = :status', { status: ProjectStatus.FUNDING });

    // Fetch all funding projects to sort them in memory
    let projects = await queryBuilder.getMany();

    if (interactions.length === 0) {
      // Cold Start
      projects.sort((a, b) => {
        const diffRaised = Number(b.raisedAmount) - Number(a.raisedAmount);

        if (diffRaised !== 0) {
          return diffRaised;
        }

        const dateA = a.createdAt?.getTime() ?? 0;
        const dateB = b.createdAt?.getTime() ?? 0;

        return dateB - dateA;
      });


    } else {
      // Match Score Logic based on user's past interactions
      const preferredTrls = new Set(interactions.map(i => i.project?.trlLevel).filter(t => t != null));
      const preferredCreators = new Set(interactions.map(i => i.project?.creator?.id).filter(Boolean));

      const scoredProjects = projects.map((project) => {
        let score = 0;

        if (project.trlLevel && preferredTrls.has(project.trlLevel)) {
          score += 5;
        }

        if (project.creator && preferredCreators.has(project.creator.id)) {
          score += 10;
        }

        return { project, score };
      });

      scoredProjects.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return Number(b.project.raisedAmount) - Number(a.project.raisedAmount);
      });

      projects = scoredProjects.map(sp => sp.project);
    }

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    return projects.slice(skip, skip + limit);
  }

  async recordInteraction(userId: string, projectId: string, type: InteractionType): Promise<Interaction> {
    const scoreMap = {
      [InteractionType.VIEW]: 1,
      [InteractionType.LIKE]: 5,
      [InteractionType.PLEDGE]: 10,
    };

    let interaction = await this.interactionRepository.findOne({
      where: { userId, projectId, interactionType: type },
    });

    if (!interaction) {
      interaction = this.interactionRepository.create({
        userId,
        projectId,
        interactionType: type,
        score: scoreMap[type],
      });
    } else {
      interaction.score = scoreMap[type];
    }

    return this.interactionRepository.save(interaction);
  }

  @OnEvent('payment.success')
  async handlePaymentSuccess(payload: { userId: string; projectId: string }) {
    if (payload && payload.userId && payload.projectId) {
      await this.recordInteraction(payload.userId, payload.projectId, InteractionType.PLEDGE);
    }
  }
}
