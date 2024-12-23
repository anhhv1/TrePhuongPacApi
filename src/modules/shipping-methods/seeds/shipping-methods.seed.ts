import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import data from './data.json';
import { ShippingMethods, ShippingMethodsDocument } from '../shipping-methods.schema';

@Injectable()
export class ShippingMethodsSeed {
  constructor(
    @InjectModel(ShippingMethods.name) private shippingMethodsModel: Model<ShippingMethodsDocument>
  ) {}

  @Command({ command: 'seed:shipping-methods', describe: 'Seed Shipping Methods' })
  async create(): Promise<void> {
    await this.shippingMethodsModel.deleteMany({});
    await this.shippingMethodsModel.insertMany(data);
  }
}