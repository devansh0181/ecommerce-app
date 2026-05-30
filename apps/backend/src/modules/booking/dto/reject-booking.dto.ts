import { IsString, IsOptional } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}