import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import data from './data.json';
import { Products, ProductsDocument } from '../products.schema';

@Injectable()
export class ProductsSeed {
  constructor(@InjectModel(Products.name) private productsModel: Model<ProductsDocument>) {}

  @Command({ command: 'seed:products', describe: 'Seed Products' })
  async create(): Promise<void> {
    await this.productsModel.deleteMany({});
    await this.productsModel.insertMany(data);
  }
}
