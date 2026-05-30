import { IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../../../common/enums/booking-status.enum'

export class BookingQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}