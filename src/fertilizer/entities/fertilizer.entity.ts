import { ApiProperty } from '@nestjs/swagger';

export class FertilizerEntity {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' }) date: string;
  @ApiProperty({ example: 250000 }) amountPaid: number;
  @ApiProperty({ example: 'Karbamid (avgust partiya)', required: false }) comment?: string;
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' }) createdAt?: string;
  @ApiProperty({ example: '2025-08-01T00:00:00.000Z' }) updatedAt?: string;
}
