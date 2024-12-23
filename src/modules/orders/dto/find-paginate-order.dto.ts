import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { EOrderStatus, ProductType } from '~/constants';

export class FindPaginateOrder extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false, enum: EOrderStatus })
  @IsString()
  @IsOptional()
  status?: string;
}
