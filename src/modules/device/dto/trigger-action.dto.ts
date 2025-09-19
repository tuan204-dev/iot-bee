import { IsString } from 'class-validator';

export class TriggerActionDto {
  @IsString()
  actionId: string;

  @IsString()
  actuatorId: string;
}
