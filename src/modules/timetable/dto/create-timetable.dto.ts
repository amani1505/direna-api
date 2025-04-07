import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateTimetableDto {
  @IsNotEmpty()
  @IsDateString()
  start_time: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  max_participants?: number;

  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @IsNotEmpty()
  @IsUUID()
  trainerId: string;

  //   @IsNotEmpty()
  //   @IsUUID()
  //   roomId: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  color?: string;
}
