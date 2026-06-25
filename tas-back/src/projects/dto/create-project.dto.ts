import { Complexity } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  Min, 
  IsDateString, 
  Length, 
  IsPositive, 
  IsBoolean,
  IsOptional
} from 'class-validator';

export class TierDto {
  amount!: number;
  benefit!: string;
}


export class CreateProjectDto {

  @IsNotEmpty({ message: 'El título del proyecto es obligatorio.' })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @Length(5, 100, { message: 'El título debe tener entre 5 y 100 caracteres.' })
  title!: string;

  @IsNotEmpty({ message: 'El resumen del proyecto es obligatorio.' })
  @IsString({ message: 'El resumen debe ser una cadena de texto.' })
  @Length(5, 100, { message: 'El resumen debe tener entre 5 y 100 caracteres.' })
  resume!: string;

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El tamano del equipo debe ser un valor numérico.' })
  teamSize!: number;

  @IsNotEmpty({ message: 'La experiencia del lider es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La experiencia del lider debe ser un valor numérico.' })
  supervisorExperience!: number;

  @IsNotEmpty({ message: 'El sector es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El sector debe ser un valor numérico.' })
  sector!: number;

  @IsNotEmpty({ message: 'La cantidad de proyectos similares es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'La cantidad de proyectos similares debe ser un valor numérico.' })
  priorSimilarProjects!: number;

  @IsNotEmpty({ message: 'El nivel TRL es obligatorio.' })
  @IsNumber({}, { message: 'El TRL debe ser un valor numérico.' })
  @Type(() => Number)
  @IsPositive({ message: 'El TRL debe ser positivo.' })
  @Min(1)
  trlLevel!: number;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasTechnicalDoc!: boolean;

  @IsNotEmpty({ message: 'El campo de patentes es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser verdadero o falso.' })
  hasPatents!: boolean;

  @IsNotEmpty({ message: 'El campo de video pitch es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser verdadero o falso.' })
  hasVideoPitch!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasMonetizationModel!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasMarketStudy!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasDirectCompetitors!: boolean;
  
  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  durationMonths!: number;

  @IsNotEmpty({ message: 'La descripción del proyecto es obligatoria.' })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @Length(20, 1000, { message: 'La descripción debe ser más detallada (entre 20 y 1000 caracteres).' })
  description!: string;

  @IsNotEmpty({ message: 'La fecha límite de la campaña es obligatoria.' })
  @IsDateString({}, { message: 'La fecha límite debe ser una fecha válida (formato ISO 8601, ej. YYYY-MM-DD).' })
  deadLine!: string;


  @IsNotEmpty({ message: 'El título del proyecto es obligatorio.' })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  complexity!: Complexity;

    
  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  budget!: number;

  @IsOptional()
  @IsString()
  fileDescriptions?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowFree!: boolean;

  @IsOptional()
  @IsString()
  tiers: any;
}
