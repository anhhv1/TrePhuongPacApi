import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ACCOUNT_MESSAGES, EAccountRole, RegexConstant } from '~/constants';
import { Match } from '~/decorators/match.decorator';

export class RegisterAdminDto {
  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    },
  )
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({ enum: EAccountRole })
  @IsNotEmpty({ message: 'Role cannot be empty' })
  role: EAccountRole;

  @ApiProperty()
  @Matches(RegexConstant.fullname, { message: ACCOUNT_MESSAGES.FULLNAME_INVALID })
  @IsNotEmpty({ message: 'Fullname cant be empty' })
  fullname: string;

  @ApiProperty({ default: 'admin123' })
  @MinLength(6, { message: 'Password must be greater than 6 characters' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @ApiProperty({ default: 'admin123' })
  @Match('password', { message: 'Password is not matching' })
  passwordConfirm: string;
}
