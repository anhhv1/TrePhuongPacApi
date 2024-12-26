import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';

export class FindPaginateImage extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Filter images by filename (supports partial match)',
  })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiProperty({
    required: false,
    description: 'Filter images by mimetype (e.g., image/jpeg)',
  })
  @IsString()
  @IsOptional()
  mimetype?: string;
}
