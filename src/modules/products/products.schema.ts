import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type ProductsDocument = Products & Document;

@BaseSchema()
export class Products extends BaseMongo {
  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop({ default: null })
  @ApiProperty()
  type: string;

  @Prop({ default: 0 })
  @ApiProperty()
  quantity: number;

  @Prop({ default: 0 })
  @ApiProperty()
  price: number;

  @Prop({ default: 0 })
  @ApiProperty()
  discount: number;

  @Prop({ type: [String], default: [] })
  @ApiProperty({
    type: [String],
    description: 'Array of thumbnail image URLs',
    example: ['image1.jpg', 'image2.jpg']
  })
  thumbnails: string[];

  @Prop({ type: [String], default: [] })
  @ApiProperty({
    type: [String],
    description: 'Array of product image URLs',
    example: ['image1.jpg', 'image2.jpg']
  })
  images: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Categories', default: null })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Category ID of the product'
  })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'imageIds', default: [] })
  @ApiProperty({
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of image IDs for the product',
  })
  imageIds: MongooseSchema.Types.ObjectId[];
}

export const ProductsSchema = SchemaFactory.createForClass(Products);
ProductsSchema.plugin(mongooseLeanVirtuals);