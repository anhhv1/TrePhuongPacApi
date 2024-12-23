import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ default: 'vietanh123456123@gmail.com' })
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    },
  )
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;
}
