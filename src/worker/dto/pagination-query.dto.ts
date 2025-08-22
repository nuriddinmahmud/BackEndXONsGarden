import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryWorkerDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsIn(['date', 'workerCount', 'salaryPerOne', 'totalSalary'])
  sortBy: 'date' | 'workerCount' | 'salaryPerOne' | 'totalSalary' = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
