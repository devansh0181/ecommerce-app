import { IsEnum, IsString, IsBoolean, IsOptional, Matches, IsArray, ValidateNested } from 'class-validator';
import { DayOfWeek } from '../../../common/enums/day-of-week.enum';
import { Type } from 'class-transformer';

export class WorkingHoursItemDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'openTime must be in HH:MM:SS format',
  })
  openTime: string; // Format: "09:00:00"

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'closeTime must be in HH:MM:SS format',
  })
  closeTime: string; // Format: "18:00:00"

  @IsBoolean()
  @IsOptional()
  isClosed?: boolean; // If true, salon is closed this day
}

export class UpdateWorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursItemDto)
  workingHours: WorkingHoursItemDto[];
}