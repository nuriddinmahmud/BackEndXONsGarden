import { Transform } from 'class-transformer';
import { 
  IsInt, 
  IsOptional, 
  IsPositive, 
  Max, 
  Min, 
  IsString, 
  IsIn 
} from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  @Max(100) // limitni cheklash (serverni ekspluatatsiya qilmaslik uchun)
  limit: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // qaysi field bo‘yicha sortlash (masalan: "createdAt")

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder must be asc or desc',
  })
  sortOrder: 'asc' | 'desc' = 'desc';

  // offsetni hisoblash uchun getter
  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
