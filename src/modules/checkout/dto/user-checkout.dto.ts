import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UserCheckout {
  @ApiProperty()
  @IsMongoId({ message: 'ID is not match' })
  @IsNotEmpty({ message: 'ID is required' })
  userId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Phone is required' })
  @IsString()
  phone: string;

  @ApiProperty({ default: 'vietanh123456123@gmail.com'})
  @IsNotEmpty({ message: 'Email is required'})
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Contact is required' })
  @IsString()
  contact: string;

  @ApiProperty()
  @IsString()
  note: string;
}
