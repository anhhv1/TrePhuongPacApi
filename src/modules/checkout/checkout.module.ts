import { Module, forwardRef } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/order.schema';
import { OrdersModule } from '../orders/orders.module';
import { Products, ProductsSchema } from '../products/products.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Products.name, schema: ProductsSchema },
    ]),
    forwardRef(() => OrdersModule),
    forwardRef(() => ProductsModule),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
