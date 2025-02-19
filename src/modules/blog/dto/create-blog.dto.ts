import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim, SanitizeHTML } from '@lib/transformer';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  @Trim()
  @SanitizeHTML()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @SanitizeHTML()
  content: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsString()
  image: string;
}
