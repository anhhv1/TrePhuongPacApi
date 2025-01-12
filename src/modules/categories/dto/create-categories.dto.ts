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

  @ApiProperty({
    type: String,
    description: 'Image URLs',
    example: "image2.jpg"
  })
  @IsString()
  @IsNotEmpty({ message: 'Category image cannot be empty' })
  image: string;

  @ApiProperty()
  @IsString()
  slug: string;

}