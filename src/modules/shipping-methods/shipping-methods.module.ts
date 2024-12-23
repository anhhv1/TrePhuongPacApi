// shipping-methods.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingMethodsService } from './shipping-methods.service';
import { ShippingMethodsController } from './shipping-methods.controller';
import { ShippingMethods, ShippingMethodsSchema } from './shipping-methods.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShippingMethods.name, schema: ShippingMethodsSchema }
    ])
  ],
  controllers: [ShippingMethodsController],
  providers: [ShippingMethodsService],
  exports: [ShippingMethodsService]
})
export class ShippingMethodsModule {}