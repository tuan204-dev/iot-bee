import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchSensorDataDto {
  @ApiProperty({
    description:
      'Field to search in. Options: all, id, name, temp, humidity, light, time',
    example: 'all',
    enum: ['all', 'id', 'name', 'temp', 'humidity', 'light', 'time'],
    required: false,
  })
  @IsOptional()
  @IsString()
  searchField?: string;

  @ApiProperty({
    description:
      'Value to search for. For time field, use flexible format (YYYY, YYYY-MM, YYYY-MM-DD, etc.)',
    example: 'temperature',
    required: false,
  })
  @IsOptional()
  @IsString()
  searchValue?: string;

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
