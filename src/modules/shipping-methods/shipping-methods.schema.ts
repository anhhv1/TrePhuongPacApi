import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShippingMethodsDocument = ShippingMethods & Document;

@Schema({ timestamps: true })
export class ShippingMethods {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ShippingMethodsSchema = SchemaFactory.createForClass(ShippingMethods);