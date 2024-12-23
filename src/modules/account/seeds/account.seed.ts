import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import data from './data.json';
import { Account } from '../account.schema';

@Injectable()
export class AccountSeed {
  constructor(@InjectModel(Account.name) private accountModel: Model<Account>) {}

  @Command({ command: 'seed:account', describe: 'Seed accounts' })
  async create(): Promise<void> {
    await this.accountModel.deleteMany({});
    await this.accountModel.insertMany(data);
  }
}
