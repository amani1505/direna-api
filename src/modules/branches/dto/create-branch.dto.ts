import {
  IsString,
} from 'class-validator';

export class CreateBranchDto {
@IsString()
  city: string;
  
  @IsString()
  country: string;
  
  @IsString()
  street: string;
  
  @IsString()
  district: string;
  
  @IsString()
  house_no: string;
  
  @IsString()
  road: string;
}
