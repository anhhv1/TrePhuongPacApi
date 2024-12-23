import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, NotContains } from 'class-validator';
import { ACCOUNT_MESSAGES, RegexConstant } from '~/constants';
import { IsNotBlank } from '~/decorators/isNotBlank.decorator';

export class UpdateInfoDto {
  @ApiProperty({ required: false })
  @NotContains('~', { message: 'Email is invalid' })
  @NotContains('!', { message: 'Email is invalid' })
  @NotContains('#', { message: 'Email is invalid' })
  @NotContains('$', { message: 'Email is invalid' })
  @NotContains('%', { message: 'Email is invalid' })
  @NotContains('^', { message: 'Email is invalid' })
  @NotContains('&', { message: 'Email is invalid' })
  @NotContains('*', { message: 'Email is invalid' })
  @NotContains('-', { message: 'Email is invalid' })
  @NotContains('+', { message: 'Email is invalid' })
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    },
  )
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @Matches(RegexConstant.fullname, { message: ACCOUNT_MESSAGES.FULLNAME_INVALID })
  @IsNotBlank()
  @IsNotEmpty()
  fullname: string;
}
