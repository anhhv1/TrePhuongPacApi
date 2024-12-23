import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI', 'mongodb+srv://anhhv:130120@cluster0.hcdhijj.mongodb.net/amor_agency?retryWrites=true&w=majority'),
        autoCreate: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
