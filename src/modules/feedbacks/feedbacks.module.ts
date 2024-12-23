import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController, UserFeedbacksController } from './feedbacks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedbacks, FeedbacksSchema } from './feedbacks.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Feedbacks.name, schema: FeedbacksSchema }])],
  controllers: [FeedbacksController, UserFeedbacksController],
  providers: [FeedbacksService],
  exports: [FeedbacksService],
})
export class FeedbacksModule {}
