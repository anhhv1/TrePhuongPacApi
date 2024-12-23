import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TimeDto {
  @ApiProperty()
  @Length(7, 7)
  @IsString()
  @IsNotEmpty()
  month: string;
}
