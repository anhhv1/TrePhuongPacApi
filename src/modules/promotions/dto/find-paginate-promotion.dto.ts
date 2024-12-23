import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '~/common/dto/pagination.dto';

export class FindPaginatePromotion extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'SUMMER',
    description: 'Search by code'
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter valid promotions only',
    type: Boolean
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isValid?: boolean;
}