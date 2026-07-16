import { IsOptional, IsString, IsNumber, Min, IsUUID, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../entities/project.entity';

export class FindProjectsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  creatorId?: string;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
