import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSensorDataDto {
  @ApiProperty({
    description: 'Array of sensor IDs to filter by',
    example: [1, 2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sensorIds?: number[];

  @ApiProperty({
    description: 'Unit of measurement to filter by',
    example: 'celsius',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

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
    description: 'Minimum value to filter by',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  startValue?: number;

  @ApiProperty({
    description: 'Maximum value to filter by',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  endValue?: number;

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
