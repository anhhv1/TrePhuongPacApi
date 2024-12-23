import { IsString, IsOptional, IsBoolean } from 'class-validator';
import {  PaginationQueryDto } from '~/common/dto';

export class FindPaginateShippingMethod extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}