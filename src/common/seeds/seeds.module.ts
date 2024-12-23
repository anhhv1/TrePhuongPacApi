import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsSeed } from '~/modules/products/seeds/products.seed';
import { Products, ProductsSchema } from '~/modules/products/products.schema';
import { AccountSeed } from '~/modules/account/seeds/account.seed';
import { Account, AccountSchema } from '~/modules/account/account.schema';
import { ServicesSeed } from '~/modules/services/seeds/services.seed';
import { Services, ServicesSchema } from '~/modules/services/services.schema';
import { ShippingMethodsSeed } from '~/modules/shipping-methods/seeds/shipping-methods.seed';
import { ShippingMethods, ShippingMethodsSchema } from '~/modules/shipping-methods/shipping-methods.schema';

@Module({
  imports: [
    CommandModule,
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Services.name, schema: ServicesSchema },
      { name: ShippingMethods.name, schema: ShippingMethodsSchema },
    ]),
  ],
  providers: [ProductsSeed, AccountSeed, ServicesSeed,ShippingMethodsSeed],
})
export class SeedsModule {}
