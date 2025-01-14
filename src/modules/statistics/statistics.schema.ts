import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type StatisticsDocument = Statistics & Document;

interface IMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  growthRate: number;
}

interface IOrderStatusStats {
  pending: number;
  processing: number;
  resolved: number;
  cancelled: number;
}

interface ICategoryStats {
  categoryId: MongooseSchema.Types.ObjectId;
  name: string;
  count: number;
  revenue: number;
}

interface IProductStats {
  productId: MongooseSchema.Types.ObjectId;
  name: string;
  soldQuantity: number;
  revenue: number;
}

interface IPromotionStats {
  code: string;
  usageCount: number;
  totalDiscount: number;
}

interface IShippingStats {
  methodId: MongooseSchema.Types.ObjectId;
  name: string;
  usageCount: number;
  revenue: number;
}

@Schema({ timestamps: true })
export class Statistics {
  @Prop({ required: true, enum: ['daily', 'monthly', 'yearly'] })
  type: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Object, required: true })
  metrics: IMetrics;

  @Prop({ type: Object, required: true })
  orderStatus: IOrderStatusStats;

  @Prop([{
    categoryId: { type: MongooseSchema.Types.ObjectId, ref: 'Categories' },
    name: String,
    count: Number,
    revenue: Number
  }])
  categoryStats: ICategoryStats[];

  @Prop([{
    productId: { type: MongooseSchema.Types.ObjectId, ref: 'Products' },
    name: String,
    soldQuantity: Number,
    revenue: Number
  }])
  topProducts: IProductStats[];

  @Prop([{
    code: String,
    usageCount: Number,
    totalDiscount: Number
  }])
  promotionStats: IPromotionStats[];

  @Prop([{
    methodId: { type: MongooseSchema.Types.ObjectId, ref: 'ShippingMethods' },
    name: String,
    usageCount: Number,
    revenue: Number
  }])
  shippingStats: IShippingStats[];

  @Prop({ type: Object })
  customerStats: {
    new: number;
    returning: number;
    topCustomers: Array<{
      userId: MongooseSchema.Types.ObjectId;
      orderCount: number;
      totalSpent: number;
    }>;
  };

  @Prop({ type: Object })
  feedbackStats: {
    total: number;
    averageRating: number;
    ratingDistribution: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
  };
}

export const StatisticsSchema = SchemaFactory.createForClass(Statistics);