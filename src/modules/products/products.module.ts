import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController, UserProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Products, ProductsSchema } from './products.schema';
import { Categories, CategoriesSchema } from '../categories/categories.schema';
import { Uploads, UploadSchema } from '../upload/upload.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
      { name: Categories.name, schema: CategoriesSchema },
      { name: Uploads.name, schema: UploadSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ProductsController, UserProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
