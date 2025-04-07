import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePackageDto {
  //   @ApiProperty({
  //     description: 'Name of the gym package',
  //     example: 'Premium Membership',
  //   })
  @IsNotEmpty()
  @IsString()
  name: string;

  //   @ApiProperty({
  //     description: 'Description of the gym package',
  //     example: 'Full access to all gym facilities including classes',
  //   })
  @IsNotEmpty()
  @IsString()
  description: string;

  //   @ApiProperty({
  //     description: 'Price of the gym package',
  //     example: 99.99,
  //   })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  //   @ApiProperty({
  //     description: 'Duration of the package in days',
  //     example: 30,
  //   })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  duration_days: number;

  //   @ApiProperty({
  //     description: 'Whether the package is currently active',
  //     default: true,
  //   })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  //   @ApiProperty({
  //     description: 'Maximum number of sessions allowed (0 for unlimited)',
  //     default: 0,
  //   })
  //   @IsOptional()
  //   @IsNumber()
  //   @Min(0)
  //   max_sessions?: number;

  //   @ApiProperty({
  //     description: 'Whether the package has unlimited sessions',
  //     default: false,
  //   })
  @IsOptional()
  @IsBoolean()
  is_unlimited?: boolean;
}
