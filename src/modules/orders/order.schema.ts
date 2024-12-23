import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { EOrderStatus } from '~/constants';

export type OrderDocument = Order & Document;

@BaseSchema()
export class Order extends BaseMongo {
  @Prop({ required: true })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'User ID'
  })
  userId: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'John Doe',
    description: 'Customer full name'
  })
  fullname: string;

  @Prop({ default: null })
  @ApiProperty({
    example: 'john@example.com',
    description: 'Customer email'
  })
  email: string;

  @Prop({ required: true })
  @ApiProperty({
    example: ['507f1f77bcf86cd799439011'],
    description: 'Array of product IDs'
  })
  products: string[];

  @Prop({ default: EOrderStatus.PENDING })
  @ApiProperty({ 
    enum: EOrderStatus, 
    default: EOrderStatus.PENDING,
    description: 'Order status' 
  })
  status: EOrderStatus;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 299000,
    description: 'Subtotal amount before discount'
  })
  subtotal: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Promotions', default: null })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Applied promotion ID'
  })
  promotionId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 50000,
    description: 'Discount amount from promotion'
  })
  discountAmount: number;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 249000,
    description: 'Total amount after discount'
  })
  totalAmount: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ShippingMethods', default: null })
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Shipping method ID'
  })
  shippingMethodId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 30000,
    description: 'Shipping fee'
  })
  shippingFee: number;

  @Prop({ default: null })
  @ApiProperty({
    example: '123 Street, City',
    description: 'Shipping address'
  })
  shippingAddress: string;

  @Prop({ default: 'COD' })
  @ApiProperty({
    example: 'COD',
    description: 'Payment method'
  })
  paymentMethod: string;

  @Prop({ default: 'PENDING' })
  @ApiProperty({
    example: 'PENDING',
    description: 'Payment status'
  })
  paymentStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(mongooseLeanVirtuals);