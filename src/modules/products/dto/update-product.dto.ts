import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsMongoId, IsArray } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { ProductType } from '~/constants';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    example: 'Bamboo Chair',
    description: 'Name of the product',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(1)
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiPropertyOptional({
    enum: ProductType,
    example: ProductType.FACEBOOK_PROFILE,
    description: 'Type of the product',
  })
  @IsOptional()
  type: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Available quantity',
  })
  @IsOptional()
  quantity: number;

  @ApiPropertyOptional({
    example: 299000,
    description: 'Price in VND',
  })
  @IsOptional()
  price: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Discount percentage',
  })
  @IsOptional()
  discount: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['thumb1.jpg', 'thumb2.jpg'],
    description: 'Array of thumbnail image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thumbnails?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['image1.jpg', 'image2.jpg'],
    description: 'Array of product image URLs',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

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
