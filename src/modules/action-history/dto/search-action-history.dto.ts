import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class SearchActionHistoryDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actuatorIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actionIds?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  queryName?: string; // This can be used to search by action name or description

  @IsOptional()
  @IsNumber()
  startDate?: number;

  @IsOptional()
  @IsNumber()
  endDate?: number;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
}
