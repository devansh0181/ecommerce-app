import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SalonQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name or address

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOpen?: boolean; // Filter by open status

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minRating?: number; // Filter by minimum rating

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}