import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CreateUploadDto {
  @ApiProperty({
    example: 'image-123.jpg',
    description: 'Name of the uploaded file'
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the uploaded file'
  })
  @IsString()
  mimetype: string;

  @ApiProperty({
    example: '/uploads/image-123.jpg',
    description: 'Storage path of the uploaded file'
  })
  @IsString()
  path: string;

  @ApiProperty({
    example: 1024000,
    description: 'Size of the file in bytes'
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    example: 'product-thumbnail',
    description: 'Type or purpose of the uploaded file',
    required: false
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Related product ID if the upload is associated with a product',
    required: false
  })
  @IsOptional()
  productId?: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    example: 'https://your-cdn.com/images/image-123.jpg',
    description: 'Public URL of the uploaded file',
    required: false
  })
  @IsOptional()
  @IsString()
  url?: string;
}
