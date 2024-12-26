import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type UploadDocument = Uploads & Document;

@BaseSchema()
export class Uploads extends BaseMongo {
  @Prop({ required: true })
  @ApiProperty({
    example: 'image-123.jpg',
    description: 'Name of the uploaded file'
  })
  filename: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the uploaded file'
  })
  mimetype: string;

  @Prop({ required: true })
  @ApiProperty({
    example: '/uploads/image-123.jpg',
    description: 'Storage path of the uploaded file'
  })
  path: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 1024000,
    description: 'Size of the file in bytes'
  })
  size: number;

  @Prop({ default: null })
  @ApiProperty({
    example: 'product-thumbnail',
    description: 'Type or purpose of the uploaded file'
  })
  type: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Products', default: null })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Related product ID if the upload is associated with a product'
  })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ default: null })
  @ApiProperty({
    example: 'https://your-cdn.com/images/image-123.jpg',
    description: 'Public URL of the uploaded file'
  })
  url: string;
}

export const UploadSchema = SchemaFactory.createForClass(Uploads);
UploadSchema.plugin(mongooseLeanVirtuals);