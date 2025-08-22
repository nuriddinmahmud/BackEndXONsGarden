import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxDto {
  @ApiProperty({ example: 'Qiymat', description: '' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 1500, description: 'Qanchaligi' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Paid in advance', description: 'Tavsifini' })
  @IsOptional()
  @IsString()
  comment?: string;
}
