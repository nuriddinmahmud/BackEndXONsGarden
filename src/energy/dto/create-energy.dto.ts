import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEnergyDto {
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z', description: 'Hisob sanasi (ISO 8601)' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 125000.5, description: 'To‘langan summa' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({ example: 'Avgust uchun elektr energiya to‘lovi', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
