import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { EFeedbackStatus, EServiceType } from '~/constants';

export class FindPaginateFeedback extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false, enum: EFeedbackStatus })
  @IsString()
  @IsOptional()
  isReply?: string;
}
