import {
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class SearchSensorDataDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sensorIds?: string[];

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  startDate?: number;

  @IsOptional()
  @IsNumber()
  endDate?: number;

  @IsOptional()
  @IsNumber()
  startValue?: number;

  @IsOptional()
  @IsNumber()
  endValue?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
}
