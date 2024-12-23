import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ACCOUNT_MESSAGES, EAccountRole, EAccountStatus, RegexConstant } from '~/constants';

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(RegexConstant.fullname, { message: ACCOUNT_MESSAGES.FULLNAME_INVALID })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ enum: EAccountStatus })
  @IsEnum(EAccountStatus)
  @IsNotEmpty()
  status: EAccountStatus;
}

export class UpdateAdminDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @Matches(RegexConstant.fullname, { message: ACCOUNT_MESSAGES.FULLNAME_INVALID })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({ enum: EAccountStatus })
  @IsEnum(EAccountStatus)
  @IsNotEmpty()
  status: EAccountStatus;

  @ApiProperty({
    enum: EAccountRole,
  })
  @IsEnum(EAccountRole)
  @IsNotEmpty()
  role: EAccountRole;
}
