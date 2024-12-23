import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController, UserProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, ProductsSchema } from './products.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Products.name, schema: ProductsSchema }])],
  controllers: [ProductsController, UserProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
