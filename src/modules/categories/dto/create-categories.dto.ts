import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}