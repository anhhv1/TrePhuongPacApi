import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSchema } from 'src/decorators';
import { BaseMongo } from 'src/common/dto';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type PromotionsDocument = Promotions & Document;

@BaseSchema()
export class Promotions extends BaseMongo {
  @Prop({ required: true })
  @ApiProperty({
    example: 'SUMMER2024',
    description: 'Promotion code'
  })
  code: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Summer Sale 2024',
    description: 'Promotion name'
  })
  name: string;

  @Prop({ default: null })
  @ApiProperty({
    example: 'Get 20% off for all bamboo products',
    description: 'Promotion description'
  })
  description: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'PERCENTAGE',
    description: 'Type of discount (PERCENTAGE, FIXED_AMOUNT)',
    enum: ['PERCENTAGE', 'FIXED_AMOUNT']
  })
  type: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 20,
    description: 'Discount value (percentage or fixed amount)'
  })
  value: number;

  @Prop({ required: true })
  @ApiProperty({
    example: '2024-06-01',
    description: 'Promotion start date'
  })
  startDate: Date;

  @Prop({ required: true })
  @ApiProperty({
    example: '2024-08-31',
    description: 'Promotion end date'
  })
  endDate: Date;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 1000000,
    description: 'Minimum order amount to apply promotion'
  })
  minimumOrder: number;

  @Prop({ default: null })
  @ApiProperty({
    example: 500000,
    description: 'Maximum discount amount'
  })
  maximumDiscount: number;

  @Prop({ default: true })
  @ApiProperty({
    example: true,
    description: 'Whether the promotion is active'
  })
  isActive: boolean;

  @Prop({ default: -1 })
  @ApiProperty({
    example: 100,
    description: 'Number of times the promotion can be used (-1 for unlimited)'
  })
  usageLimit: number;

  @Prop({ default: 0 })
  @ApiProperty({
    example: 50,
    description: 'Number of times the promotion has been used'
  })
  usageCount: number;
}

export const PromotionsSchema = SchemaFactory.createForClass(Promotions);
PromotionsSchema.plugin(mongooseLeanVirtuals);