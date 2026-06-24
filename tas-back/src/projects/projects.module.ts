import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ProjectsService, PrismaService],
  controllers: [ProjectsController]
})
export class ProjectsModule {}
