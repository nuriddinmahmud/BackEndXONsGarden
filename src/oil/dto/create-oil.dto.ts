import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOilDto {
  @ApiProperty({
    example: '2025-08-01T10:00:00.000Z',
    required: false,
    description: 'Agar yuborilmasa, DB default(now()) ishlaydi',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 45.5, description: 'Yoqilg‘i miqdori (litr)' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  liters: number;

  @ApiProperty({ example: 120000, description: 'Narx (umumiy yoki birlik narx — sxemangizga qarab)' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Gazprom — Ai-92', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
