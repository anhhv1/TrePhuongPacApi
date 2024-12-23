import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { IsNotBlank } from '~/decorators/isNotBlank.decorator';

export class UpdatePasswordByOTPDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  otp: number;

  @ApiProperty()
  @IsNotBlank({ message: 'Please enter your current password.' })
  @IsNotEmpty({
    message: 'Please enter your current password.',
  })
  newPassword: string;
}
