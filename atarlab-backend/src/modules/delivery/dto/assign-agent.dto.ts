import { IsOptional, IsInt, IsUUID, Min } from 'class-validator';

export class AssignAgentDto {
  @IsUUID()
  agentId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  etaMinutes?: number;
}
