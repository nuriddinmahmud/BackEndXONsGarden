import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFertilizerDto {
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z', required: false, description: 'Agar yuborilmasa, DB default(now()) ishlaydi' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Karbamid' })
  @IsString()
  fertilizerType: string;

  @ApiProperty({ example: 'MTZ-82, 2ta agregat' })
  @IsString()
  machineCount: string;

  @ApiProperty({ example: 12.5, description: 'O‘g‘it miqdori (tonna)' })
  @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
  @IsNumber()
  @Min(0)
  tonAmount: number;

  @ApiProperty({ example: 'Avgust partiya', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
