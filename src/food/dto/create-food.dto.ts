import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFoodDto {
  @ApiProperty({
    example: '2025-08-01T10:00:00.000Z',
    required: false,
    description: 'Agar yuborilmasa, DB default(now()) ishlaydi',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Korzinka Supermarket' })
  @IsString()
  shopName: string;

  @ApiProperty({ example: 350000.5, description: 'Ovqat xarajat summasi' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Ishchilar uchun tushlik', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
