import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaxDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
