import { ArrayMinSize, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUsersDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  ids: string[];
}
