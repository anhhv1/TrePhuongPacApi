import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { EFeedbackStatus } from '~/constants';

export class CreateFeedbackDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    },
  )
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty()
  service: string;

  @ApiProperty()
  budget: number;

  @ApiProperty()
  contact: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  @ApiPropertyOptional({ default: EFeedbackStatus.NEW, enum: EFeedbackStatus })
  isReply: string;
}
