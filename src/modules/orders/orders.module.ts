import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController, UserOrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { PromotionsModule } from '../promotions/promotions.module';
import { ShippingMethodsModule } from '../shipping-methods/shipping-methods.module';
import { MailModule } from '~/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PromotionsModule,
    ShippingMethodsModule,
    MailModule
  ],
  controllers: [OrdersController, UserOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}