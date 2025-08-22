import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsPositive, IsString } from 'class-validator';
import { TransportType } from '@prisma/client';

export class QueryTransportDto {
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
  @IsEnum(TransportType)
  type?: TransportType;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'plate', 'type', 'model'])
  sortBy: 'createdAt' | 'updatedAt' | 'plate' | 'type' | 'model' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
