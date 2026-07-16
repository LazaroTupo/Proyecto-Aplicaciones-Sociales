import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { FindProjectsDto } from './dto/find-projects.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('sustentos', 10, {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.projectsService.create(createProjectDto, req.user, files);
  }

  @Get()
  // Public endpoint
  findAll(@Query() query: FindProjectsDto) {
    return this.projectsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.projectsService.getStats();
  }

  @Get(':id')
  // Public endpoint
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }



  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('sustentos', 10, {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id, files);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ) {
    return this.projectsService.updateStatus(id, updateProjectStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Delete(':id/files/:filename')
  @UseGuards(JwtAuthGuard)
  removeFile(
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Req() req,
  ) {
    return this.projectsService.removeFile(id, filename, req.user.id);
  }
}
