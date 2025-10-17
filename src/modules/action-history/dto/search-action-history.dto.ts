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
    description: 'Search query for action name or description',
    example: 'turn on',
    required: false,
  })
  @IsOptional()
  @IsString()
  queryName?: string; // This can be used to search by action name or description

  @ApiProperty({
    description: 'Start date timestamp (Unix timestamp)',
    example: 1609459200000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  startDate?: number;

  @ApiProperty({
    description: 'End date timestamp (Unix timestamp)',
    example: 1609545600000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  endDate?: number;

  @ApiProperty({
    description: 'Specific date to filter by (Unix timestamp)',
    example: 1609459200000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  date?: number;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'timestamp',
    default: 'timestamp',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number = 10;

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
  page?: number = 1;
}
