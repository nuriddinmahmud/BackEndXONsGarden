import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDrainageDto {
  @ApiPropertyOptional({ example: '2025-08-22T06:30:00.000Z', description: 'Kiritilmasa now() ishlatiladi' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 6.5, description: 'Ishlangan soat' })
  @IsNumber()
  @Min(0)
  hoursWorked: number;

  @ApiProperty({ example: 450000, description: 'Umumiy ish haqi' })
  @IsNumber()
  @Min(0)
  totalSalary: number;
}
