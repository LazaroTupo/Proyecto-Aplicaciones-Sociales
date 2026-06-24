import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProjectsService {

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService
  ) { }

  async create(data: CreateProjectDto, userId: number) {

    try {

      const project = await this.prisma.project.create({
        data: {
          title: data.title,
          description: data.description,
          deadLine: new Date(data.deadLine),
          budget: data.budget,
          ownerId: userId,
          complexity: data.complexity,
          durationMonths: data.durationMonths,
          hasDirectCompetitors: data.hasDirectCompetitors,
          hasMarketStudy: data.hasMarketStudy,
          hasMonetizationModel: data.hasMonetizationModel,
          hasTechnicalDoc: data.hasTechnicalDoc,
          trlLevel: data.trlLevel,
          hasPatents: data.hasPatents,
          hasVideoPitch: data.hasVideoPitch,
          priorSimilarProjects: data.priorSimilarProjects,
          sector: data.sector,
          supervisorExperience: data.supervisorExperience,
          teamSize: data.teamSize
        }
      })

      return project;

    } catch (err) {
      console.log('err');
      console.log(err);

      throw new InternalServerErrorException(
        'Ha ocurrido un error al registrar el proyecto',
      );
    }
  }

  async getAll(userId: number) {
    try {
      const data = await this.prisma.project.findMany({
        include: {
          _count: {
            select: {
              contributions: true,
            },
          },
          contributions: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          deadLine: "desc"
        }
      });

      return data.map((project) => ({
        ...project,
        raised: project.contributions.reduce(
          (acc, contribution) => acc + contribution.amount,
          0,
        ),
        contributors: project._count.contributions,
        contributions: undefined,
        _count: undefined,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error al obtener los proyectos',
      );
    }
  }

  async getAllById(userId: number) {
    try {
      const data = await this.prisma.project.findMany({
        where: {
          ownerId: userId,
        },
        include: {
          _count: {
            select: {
              contributions: true,
            },
          },
          contributions: {
            select: {
              amount: true,
            },
          },
        },
        orderBy: {
          deadLine: "desc"
        }
      });

      return data.map((project) => ({
        ...project,
        raised: project.contributions.reduce(
          (acc, contribution) => acc + contribution.amount,
          0,
        ),
        contributors: project._count.contributions,
        contributions: undefined,
        _count: undefined,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        'Ha ocurrido un error al obtener los proyectos',
      );
    }
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: Number(id)
      },
      select: {
        title: true,
        description: true,
        deadLine: true,
        budget: true,
        ownerId: true,
        complexity: true,
        durationMonths: true,
        hasDirectCompetitors: true,
        hasMarketStudy: true,
        hasMonetizationModel: true,
        hasTechnicalDoc: true,
        trlLevel: true,
        hasPatents: true,
        hasVideoPitch: true,
        priorSimilarProjects: true,
        sector: true,
        supervisorExperience: true,
        teamSize: true,
        projectedRaisedAmount: true,
        feasibilityIndex: true,
        transparencyIndex: true,
        communityValidationScore: true,
      }
    })

    return project;
  }

  async delete(projectId: number, userId: number) {

    try {

      const project = await this.prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: userId
        },
        include: {
          _count: {
            select: { contributions: true }
          }
        }
      })

      if (!project) {
        throw new NotFoundException(
          'El proyecto no existe o no tienes permisos para gestionarlo',
        );
      }

      if (project._count.contributions > 0) {
        throw new BadRequestException(
          'No se puede eliminar el proyecto porque ya cuenta con aportaciones registradas.',
        );
      }

      await this.prisma.project.delete({
        where: { id: project.id }
      });

      return {
        success: true,
        message: 'El proyecto ha sido eliminado correctamente.'
      };


    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ocurrió un error al intentar eliminar el proyecto',
      );
    }
  }

  async update(projectId: number, userId: number, data: UpdateProjectDto) {
    try {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, ownerId: userId }
      });

      if (!project) {
        throw new NotFoundException('Proyecto no encontrado o no tienes permisos.');
      }

      return await this.prisma.project.update({
        where: { id: projectId },
        data: {
          title: data.title,
          description: data.description,
          deadLine: data.deadLine,
          budget: data.budget,
          ownerId: userId,
          complexity: data.complexity,
          durationMonths: data.durationMonths,
          hasDirectCompetitors: data.hasDirectCompetitors,
          hasMarketStudy: data.hasMarketStudy,
          hasMonetizationModel: data.hasMonetizationModel,
          hasTechnicalDoc: data.hasTechnicalDoc,
          trlLevel: data.trlLevel,
          hasPatents: data.hasPatents,
          hasVideoPitch: data.hasVideoPitch,
          priorSimilarProjects: data.priorSimilarProjects ?? 0,
          sector: data.sector,
          supervisorExperience: data.supervisorExperience ?? 0,
          teamSize: data.teamSize
        }
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Error al actualizar el proyecto.');
    }
  }

  async analyzeProject(projectId: number, userId: number) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId }
    });

    if (!project) throw new NotFoundException('Proyecto no encontrado');

    try {
      const mlApiUrl = process.env.ML_API_URL || 'http://127.0.0.1:8000';
      const { data } = await firstValueFrom(
        this.httpService.post(`${mlApiUrl}/analyze`, {
          targetBudget: project.budget ?? 0,
          durationMonths: project.durationMonths ?? 0,
          trlLevel: project.trlLevel ?? 1,
          teamSize: project.teamSize ?? 1,
          hasPatents: project.hasPatents ?? false,
          supervisorExperience: project.supervisorExperience ?? 0,
          hasTechnicalDoc: project.hasTechnicalDoc ?? false,
          hasMarketStudy: project.hasMarketStudy ?? false,
          hasVideoPitch: project.hasVideoPitch ?? false
        })
      );

      return await this.prisma.project.update({
        where: { id: projectId },
        data: {
          projectedRaisedAmount: data.projectedFundingRatio,
          feasibilityIndex: data.feasibilityIndex,
          transparencyIndex: data.transparencyIndex
        }
      });
    } catch (error) {
      console.log("Error ML API:", error);
      throw new InternalServerErrorException('Error al contactar al servicio de ML');
    }
  }
}