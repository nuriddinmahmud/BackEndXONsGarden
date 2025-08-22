import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendCodeDto {
  @ApiProperty({ example: 'nuriddin@example.com' })
  @IsEmail()
  email: string;
}
