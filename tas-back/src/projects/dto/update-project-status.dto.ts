import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectStatusDto {
  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
