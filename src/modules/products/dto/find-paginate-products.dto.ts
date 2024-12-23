import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { ProductType } from '~/constants';

export class FindPaginateProduct extends PaginationQueryDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, enum: ProductType })
  @IsString()
  @IsOptional()
  type?: string;
}
