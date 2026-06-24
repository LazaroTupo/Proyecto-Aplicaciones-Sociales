import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {

  constructor(private readonly projectsService: ProjectsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() body: CreateProjectDto,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.projectsService.create(body, userId);
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('allByUser')
  async getAllById(
    @Req() req: any
  ) {
    const userId = req.user.id;    
    return this.projectsService.getAllById(userId);
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAll(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user.id;
    return this.projectsService.getAll(userId);
  }

  
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getOne(
    @Param('id') id: string,
  ) {

    return this.projectsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) projectId: number,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.projectsService.delete(projectId, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.projectsService.update(projectId, userId, updateProjectDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/analyze')
  async analyze(
    @Param('id', ParseIntPipe) projectId: number,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.projectsService.analyzeProject(projectId, userId);
  }
}