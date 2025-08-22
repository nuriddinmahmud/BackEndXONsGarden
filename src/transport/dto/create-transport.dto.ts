import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransportType } from '@prisma/client';

export class CreateTransportDto {
  @ApiProperty({ example: '90A777AA' })
  @IsString()
  plate: string;

  @ApiProperty({ enum: TransportType, example: TransportType.TRUCK })
  @IsEnum(TransportType)
  type: TransportType;

  @ApiProperty({ example: 'MAN TGS 41.400', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'Qum tashish uchun', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
