import { Complexity } from '@prisma/client';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  Min, 
  IsDateString, 
  Length, 
  IsPositive, 
  IsBoolean
} from 'class-validator';

export class CreateProjectDto {

  @IsNotEmpty({ message: 'El título del proyecto es obligatorio.' })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  @Length(5, 100, { message: 'El título debe tener entre 5 y 100 caracteres.' })
  title!: string;

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  teamSize!: number;

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  supervisorExperience!: number;

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  sector!: number;

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  priorSimilarProjects!: number;

  @IsNotEmpty({ message: 'El nivel TRL es obligatorio.' })
  @IsNumber({}, { message: 'El TRL debe ser un valor numérico.' })
  @IsPositive({ message: 'El TRL debe ser positivo.' })
  @Min(1)
  trlLevel!: number;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasTechnicalDoc!: boolean;

  @IsNotEmpty({ message: 'El campo de patentes es obligatorio.' })
  @IsBoolean({ message: 'Debe ser verdadero o falso.' })
  hasPatents!: boolean;

  @IsNotEmpty({ message: 'El campo de video pitch es obligatorio.' })
  @IsBoolean({ message: 'Debe ser verdadero o falso.' })
  hasVideoPitch!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasMonetizationModel!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasMarketStudy!: boolean;

  @IsNotEmpty({ message: 'El documento técnico es obligatorio.' })
  @IsBoolean({ message: 'El documento técnico debe ser verdadero o falso.' })
  hasDirectCompetitors!: boolean;
  
  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
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

  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  @Min(100, { message: 'El monto objetivo mínimo para un proyecto universitario es de $100.' })
  montoObjetivo!: number;

  @IsNotEmpty({ message: 'El título del proyecto es obligatorio.' })
  @IsString({ message: 'El título debe ser una cadena de texto.' })
  complexity!: Complexity;

    
  @IsNotEmpty({ message: 'El monto objetivo es obligatorio.' })
  @IsNumber({}, { message: 'El monto objetivo debe ser un valor numérico.' })
  @IsPositive({ message: 'El monto objetivo debe ser un número positivo.' })
  budget!: number;
}
