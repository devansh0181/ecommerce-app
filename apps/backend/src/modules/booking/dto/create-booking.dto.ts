import { IsArray, IsNotEmpty, IsUUID, IsDateString, ArrayMinSize } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  salonId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service must be selected' })
  @IsUUID('4', { each: true })
  serviceIds: string[];

  @IsDateString()
  @IsNotEmpty()
  preferredTime: string; // ISO 8601 format: "2024-02-15T14:00:00.000Z"
}