import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { InteractionType } from '../entities/interaction.entity';

export class CreateInteractionDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsEnum(InteractionType)
  @IsNotEmpty()
  interactionType: InteractionType;
}
