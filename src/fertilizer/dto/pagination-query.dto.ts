import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 1))
  @IsOptional() @IsNumber() @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 20))
  @IsOptional() @IsNumber() @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({
    example: 'date',
    description: 'date | tonAmount | fertilizerType | machineCount | comment | createdAt',
  })
  @IsOptional() @IsString()
  sortBy?: 'date' | 'tonAmount' | 'fertilizerType' | 'machineCount' | 'comment' | 'createdAt';

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  @IsOptional() @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ example: 'karbamid' })
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Kombayn-2' })
  @IsOptional() @IsString()
  machineCount?: string;

  @ApiPropertyOptional({ example: '2025-08-01T00:00:00.000Z' })
  @IsOptional() @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2025-08-31T23:59:59.999Z' })
  @IsOptional() @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 5 })
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  @IsOptional()
  minTon?: number;

  @ApiPropertyOptional({ example: 30 })
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  @IsOptional()
  maxTon?: number;
}
