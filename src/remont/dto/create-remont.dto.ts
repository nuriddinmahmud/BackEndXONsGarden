import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRemontDto {
  @ApiProperty({
    example: '2025-08-01T10:00:00.000Z',
    required: false,
    description: 'Agar yuborilmasa, DB default(now()) ishlaydi',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Nasos agregatini ta’mirlash' })
  @IsString()
  description: string;

  @ApiProperty({ example: 750000, description: 'Ta’mir xarajati' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: 'Detal almashtirildi', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
