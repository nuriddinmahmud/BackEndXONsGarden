import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ example: '2025-08-22T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Yer solig‘i' })
  @IsString()
  title: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Qo‘shimcha izoh', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
