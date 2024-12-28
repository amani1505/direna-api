import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateRoleDto {
  //   @ApiProperty({ description: 'Role name', minimum: 3, maximum: 50 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  //   @ApiPropertyOptional({ description: 'Role description', maximum: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
