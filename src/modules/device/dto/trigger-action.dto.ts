import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerActionDto {
  @ApiProperty({
    description: 'The ID of the action to trigger',
    example: 'action123',
  })
  @IsString()
  actionId: string;

  @ApiProperty({
    description: 'The ID of the actuator to execute the action',
    example: 'actuator456',
  })
  @IsString()
  actuatorId: string;
}
