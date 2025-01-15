import { forwardRef, Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/order.schema';
import { Products, ProductsSchema } from '../products/products.schema';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { Account, AccountSchema } from '../account/account.schema';
import { AccountModule } from '../account/account.module';
import { Feedbacks, FeedbacksSchema } from '../feedbacks/feedbacks.schema';
import { ShippingMethods, ShippingMethodsSchema } from '../shipping-methods/shipping-methods.schema';
import { ShippingMethodsModule } from '../shipping-methods/shipping-methods.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Products.name, schema: ProductsSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Feedbacks.name, schema: FeedbacksSchema },
      { name: ShippingMethods.name, schema: ShippingMethodsSchema },
    ]),
    forwardRef(() => OrdersModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => AccountModule),
    forwardRef(() => ShippingMethodsModule),

  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
