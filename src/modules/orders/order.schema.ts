import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { EOrderStatus } from '~/constants';

export interface IOrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IShippingMethod {
  _id: MongooseSchema.Types.ObjectId;
  name: string;
  price: number;
  description: string;
}

export interface IPromotion {
  _id: MongooseSchema.Types.ObjectId;
  code: string;
  discount: number;
}

export interface IOrderInfo {
  userId: string;
  fullname: string;
  email: string;
  phone: string;
  company?: string;
  country: string;
  contact: string;
  note?: string;
}

export type OrderDocument = Order & Document;

@BaseSchema()
export class Order extends BaseMongo {
  @Prop({ type: Object, required: true })
  @ApiProperty({
    example: {
      fullname: 'John Doe',
      email: 'john@example.com',
      phone: '+84123456789',
      company: 'Company Name',
      country: 'Vietnam',
      contact: 'telegram: @johndoe',
      note: 'Special delivery instructions'
    },
    description: 'Customer information'
  })
  info: IOrderInfo;

  @Prop({ type: Array, required: true })
  @ApiProperty({
    example: [{
      productId: '507f1f77bcf86cd799439011',
      name: 'Product Name',
      price: 100000,
      quantity: 2,
      total: 200000
    }],
    description: 'Array of ordered products'
  })
  products: IOrderProduct[];

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
    description: 'Subtotal amount before shipping and discount'
  })
  subtotal: number;

  @Prop({ type: Object, default: null })
  @ApiProperty({
    example: {
      _id: '507f1f77bcf86cd799439011',
      code: 'SUMMER2023',
      discount: 50000
    },
    description: 'Applied promotion information'
  })
  promotion: IPromotion;

  @Prop({ type: Object, default: null })
  @ApiProperty({
    example: {
      _id: '507f1f77bcf86cd799439011',
      name: 'Express Delivery',
      price: 30000,
      description: 'Next day delivery'
    },
    description: 'Shipping method information'
  })
  shippingMethod: IShippingMethod;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 279000,
    description: 'Total amount after shipping and discount'
  })
  total: number;


  @Prop({ type: Object, default: null })
  @ApiProperty({
    example: {
      vnp_TxnRef: '123456789',
      vnp_Amount: '27900000',
      vnp_ResponseCode: '00'
    },
    description: 'Payment transaction details'
  })
  paymentDetails: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(mongooseLeanVirtuals);

