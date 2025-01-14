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
  @Prop({ type: Object, required: true })
  @ApiProperty()
  info: {
    userId: string;
    fullname: string;
    email: string;
    phone: string;
    company?: string;
    country: string;
    contact: string;
    note?: string;
  };

  @Prop({ type: Array, required: true })
  @ApiProperty()
  products: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];

  @Prop({ default: EOrderStatus.PENDING })
  @ApiProperty()
  status: EOrderStatus;

  @Prop({ default: 0 })
  @ApiProperty()
  subtotal: number;

  @Prop({ type: String, default: null })
  @ApiProperty({
    example: "SUMMER2025",
    description: 'Promotion code'
  })
  promotion: string;

  @Prop({ type: String, default: null })
  @ApiProperty({
    example: "6769211829a32037cac136f1",
    description: 'Shipping method ID'
  })
  shippingMethod: string;

  @Prop({ default: 0 })
  @ApiProperty()
  total: number;

  @Prop({ type: Object, default: null })
  @ApiProperty()
  paymentDetails: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  @ApiProperty()
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  @ApiProperty()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(mongooseLeanVirtuals);