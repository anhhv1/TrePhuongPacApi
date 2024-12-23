import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '~/common/dto';

export enum ESearchRole {
  ALL = 'ALL',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class SearchAccountDto extends PaginationQueryDto {
  @ApiProperty({ required: false, title: 'Search', description: 'Search fullname, email' })
  @IsOptional()
  keyword: string;

  @ApiProperty({ required: false, enum: ESearchRole })
  @IsString()
  @IsIn([ESearchRole.USER, ESearchRole.ADMIN, ESearchRole.ALL])
  @IsOptional()
  role: ESearchRole;
}
