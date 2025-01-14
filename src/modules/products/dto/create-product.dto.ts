import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsMongoId, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  MaxLength, 
  Min, 
  MinLength,
  IsArray
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ProductType } from '~/constants';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255, {
    message: 'Name must not be greater than 255 characters.',
  })
  @MinLength(1)
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    default: 0,
  })
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  discount: number;

  @ApiProperty({
    type: [String],
    description: 'Array of thumbnail image URLs',
    example: ['thumb1.jpg', 'thumb2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  thumbnails: string[] = [];

  @ApiProperty({
    type: [String],
    description: 'Array of product image URLs',
    example: ['image1.jpg', 'image2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'Category ID of the product',
  })
  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    type: [String],
    description: 'Array of image IDs associated with the product',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  imageIds?: string[];
}
