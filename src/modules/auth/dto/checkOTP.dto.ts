import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { ACCOUNT_MESSAGES } from '../../../constants';

export class CheckOTPDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: ACCOUNT_MESSAGES.OTP_REQUIRED })
  otp: number;
}
