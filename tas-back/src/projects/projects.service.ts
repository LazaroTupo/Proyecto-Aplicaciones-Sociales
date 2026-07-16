import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { FindProjectsDto } from './dto/find-projects.dto';
import { User } from '../users/entities/user.entity';
import { AiPredictionService } from '../ai-prediction/ai-prediction.service';
import { ManticoreService } from '../manticore/manticore.service';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProjectStatus } from './entities/project.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly aiPredictionService: AiPredictionService,
    private readonly manticoreService: ManticoreService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User, files: Express.Multer.File[]) {
    const descriptionLength = createProjectDto.descriptionLength ?? createProjectDto.description?.length ?? 0;

    // Llamar al microservicio de IA para predecir éxito
    console.log('createProjectDto');
    console.log(createProjectDto);

    const aiResult = await this.aiPredictionService.predict({
      targetAmount: createProjectDto.targetAmount ?? 0,
      durationDays: createProjectDto.durationDays ?? 0,
      trlLevel: createProjectDto.trlLevel ?? 0,
      hasVideo: createProjectDto.hasVideo || false,
      category: createProjectDto.category ?? "",
      descriptionLength,
    });

    const project = this.projectRepository.create({
      ...createProjectDto,
      descriptionLength,
      aiSuccessProbability: aiResult.successProbability,
      aiFeasibilityIndex: aiResult.feasibilityIndex,
      aiRecommendations: aiResult.recommendations,
      creator: user,
    });
    const savedProject = await this.projectRepository.save(project);

    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'projects', savedProject.id);
      await fs.mkdir(uploadDir, { recursive: true });

      const fileNames: string[] = [];
      for (const file of files) {
        const destPath = path.join(uploadDir, file.originalname);
        await fs.copyFile(file.path, destPath);
        await fs.unlink(file.path);
        fileNames.push(file.originalname);
      }

      savedProject.documentUrls = fileNames;
      await this.projectRepository.save(savedProject);
    }

    await this.manticoreService.indexProject(savedProject);

    return savedProject;
  }

  async findAll(query: FindProjectsDto) {
    const { page = 1, limit = 10, search, creatorId, filter } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (creatorId) {
      whereClause.creator = { id: creatorId };
    }
    
    if (query.status) {
      whereClause.status = query.status;
    } else if (!creatorId) {
      if(filter){
        console.log('filter');
        console.log(filter);
        whereClause.status = filter;
      }else{
        whereClause.status = In([ProjectStatus.FUNDING, ProjectStatus.FUNDED, ProjectStatus.CLOSED]);
      }
    }
    let manticoreUuids: string[] = [];

    if (search) {


      manticoreUuids = await this.manticoreService.search(search);
      if (manticoreUuids.length === 0) {
        return { data: [], total: 0, page, lastPage: 0 };
      }
      whereClause.id = In(manticoreUuids);
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    let finalData = data;
    if (search && manticoreUuids.length > 0) {
      finalData = data.sort((a, b) => {
        return manticoreUuids.indexOf(a.id) - manticoreUuids.indexOf(b.id);
      });
    }

    return {
      data: finalData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getStats() {

    const [byCategoryRaw, byStatusRaw, projects] = await Promise.all([
      this.projectRepository
        .createQueryBuilder('project')
        .select('project.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('project.category')
        .getRawMany(),

      this.projectRepository
        .createQueryBuilder('project')
        .select('project.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('project.status')
        .getRawMany(),

      this.projectRepository.find({
        select: {
          aiSuccessProbability: true,
        },
      }),
    ]);

    const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    for (const p of projects) {
      if (p.aiSuccessProbability == null) continue;
      const val = p.aiSuccessProbability;
      if (val <= 20) buckets['0-20']++;
      else if (val <= 40) buckets['21-40']++;
      else if (val <= 60) buckets['41-60']++;
      else if (val <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    }

    return {
      byCategory: byCategoryRaw.map((c) => ({
        category: c.category,
        count: parseInt(c.count, 10),
      })),
      byStatus: byStatusRaw.map((s) => ({
        status: s.status,
        count: parseInt(s.count, 10),
      })),
      byAiSuccessProbability: Object.entries(buckets).map(([range, count]) => ({
        range,
        count,
      })),
    };
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: { creator: true, rewards: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string, files?: Express.Multer.File[]) {
    const project = await this.findOne(id);

    if (project.creator.id !== userId) {
      throw new ForbiddenException('You can only edit your own projects');
    }

    if (updateProjectDto.rewards) {
      // Eliminar las recompensas antiguas para evitar choques de restricciones NOT NULL u orfandad
      await this.projectRepository.manager.delete('Reward', { project: { id: project.id } });
    }

    Object.assign(project, updateProjectDto);
    const updatedProject = await this.projectRepository.save(project);

    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'projects', updatedProject.id);
      await fs.mkdir(uploadDir, { recursive: true });

      const fileNames: string[] = [];
      for (const file of files) {
        const destPath = path.join(uploadDir, file.originalname);
        await fs.copyFile(file.path, destPath);
        await fs.unlink(file.path);
        fileNames.push(file.originalname);
      }

      updatedProject.documentUrls = [...(project.documentUrls || []), ...fileNames];
      await this.projectRepository.save(updatedProject);
    }

    await this.manticoreService.updateProject(updatedProject);

    return updatedProject;
  }

  async publish(id: string, userId: string) {
    const project = await this.findOne(id);

    if (project.creator.id !== userId) {
      throw new ForbiddenException('You can only publish your own projects');
    }

    if (project.status !== ProjectStatus.DRAFT) {
      throw new ForbiddenException('Only DRAFT projects can be published for review');
    }

    project.status = ProjectStatus.REVIEW;
    const updatedProject = await this.projectRepository.save(project);

    return updatedProject;
  }

  async updateStatus(id: string, updateProjectStatusDto: UpdateProjectStatusDto) {
    const project = await this.findOne(id);
    project.status = updateProjectStatusDto.status;

    const updatedProject = await this.projectRepository.save(project);

    this.eventEmitter.emit('project_status_changed', {
      userId: project.creator.id,
      projectId: project.id,
      projectName: project.title,
      status: project.status,
    });

    return updatedProject;
  }

  async removeFile(id: string, filename: string, userId: string) {
    const project = await this.findOne(id);

    if (project.creator.id !== userId) {
      throw new ForbiddenException('You can only delete files from your own projects');
    }

    if (!project.documentUrls || !project.documentUrls.includes(filename)) {
      throw new NotFoundException(`File ${filename} not found in this project`);
    }

    // Remove from array and save
    project.documentUrls = project.documentUrls.filter((file) => file !== filename);
    await this.projectRepository.save(project);

    // Physically delete the file
    try {
      const filePath = path.join(process.cwd(), 'uploads', 'projects', project.id, filename);
      await fs.unlink(filePath);
    } catch (error: any) {
      // Ignore if file doesn't exist on disk
      console.error(`Could not delete file ${filename} from disk:`, error.message ?? "");
    }

    return { message: 'File successfully deleted' };
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id);

    if (project.creator.id !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectRepository.remove(project);
    return { message: 'Project successfully deleted' };
  }
}
