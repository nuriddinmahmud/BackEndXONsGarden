import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: '2025-08-22T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  workerCount: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  salaryPerOne: number;

  @ApiProperty({ example: 1800000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSalary?: number;

  @ApiProperty({ example: 'Ekin maydonida mavsumiy ishlar' })
  @IsString()
  comment: string;
}
