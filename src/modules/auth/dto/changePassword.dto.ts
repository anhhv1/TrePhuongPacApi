import { IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlank } from '../../../decorators/isNotBlank.decorator';
import { RegexConstant } from '../../../constants';
import { Match } from '../../../decorators/match.decorator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotBlank({ message: 'Please enter your current password.' })
  @IsNotEmpty({
    message: 'Please enter your current password.',
  })
  password: string;

  @ApiProperty()
  @IsNotBlank({ message: 'please enter a new password.' })
  @IsNotEmpty({
    message: 'please enter a new password.',
  })
  newPassword: string;

  @ApiProperty()
  @Match('newPassword', { message: 'The password and confirmation password do not match.' })
  @IsNotBlank({ message: 'please enter a new password.' })
  @IsNotEmpty({
    message: 'please enter a new password.',
  })
  newPasswordConfirm: string;
}
