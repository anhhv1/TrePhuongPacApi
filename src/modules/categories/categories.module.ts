import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Categories, CategoriesSchema } from './categories.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema }
    ])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}