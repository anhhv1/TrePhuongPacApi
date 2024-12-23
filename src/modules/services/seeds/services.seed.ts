import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import data from './data.json';
import { Services, ServicesDocument } from '../services.schema';

@Injectable()
export class ServicesSeed {
  constructor(@InjectModel(Services.name) private ServicesModel: Model<ServicesDocument>) {}

  @Command({ command: 'seed:services', describe: 'Seed services' })
  async create(): Promise<void> {
    await this.ServicesModel.deleteMany({});
    await this.ServicesModel.insertMany(data);
  }
}
