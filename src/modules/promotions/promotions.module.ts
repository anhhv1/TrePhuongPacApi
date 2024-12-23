import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { Promotions, PromotionsSchema } from './promotions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotions.name, schema: PromotionsSchema }
    ])
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService]
})
export class PromotionsModule {}