import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0.01, { message: 'Price must be greater than 0' })
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Duration must be at least 1 minute' })
  durationMinutes?: number;
}