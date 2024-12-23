import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { EServiceCategory, EServiceType } from '~/constants';

export class FindPaginateService extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false, enum: EServiceType })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false, enum: EServiceCategory })
  @IsString()
  @IsOptional()
  category?: string;
}
