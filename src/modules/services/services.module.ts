import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController, UserServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Services, ServicesSchema } from './services.schema';

@Module({
  controllers: [ServicesController, UserServicesController],
  providers: [ServicesService],

  imports: [MongooseModule.forFeature([{ name: Services.name, schema: ServicesSchema }])],
  exports: [ServicesService],
})
export class ServicesModule {}
