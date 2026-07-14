import { IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreatePledgeDto {
  @IsNumber()
  @Min(1)
  @Max(1000000)
  amount: number;

  @IsOptional()
  @IsUUID()
  rewardId?: string;
}
