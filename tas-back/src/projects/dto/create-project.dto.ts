import { IsNotEmpty, IsString, IsNumber, Min, MaxLength, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { CreateRewardDto } from './create-reward.dto';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  trlLevel: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  hasVideo?: boolean;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  descriptionLength?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRewardDto)
  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map(item => plainToInstance(CreateRewardDto, item));
    }
    return parsed;
  })
  rewards?: CreateRewardDto[];
}
