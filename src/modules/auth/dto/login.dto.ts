import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    },
  )
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'password',
  })
  
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;
}
