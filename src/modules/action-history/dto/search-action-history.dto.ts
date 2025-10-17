import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchActionHistoryDto {
  @ApiProperty({
    description: 'Array of actuator IDs to filter by',
    example: ['actuator1', 'actuator2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actuatorIds?: string[];

  @ApiProperty({
    description: 'Array of action IDs to filter by',
    example: ['action1', 'action2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actionIds?: string[];

  @ApiProperty({
    description: 'Action status to filter by',
    example: 'success',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Date to filter by in Vietnamese format (dd/MM/yyyy HH:mm:ss)',
    example: '17/10/2025 10:13:56',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'timestamp',
    default: 'timestamp',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
}
