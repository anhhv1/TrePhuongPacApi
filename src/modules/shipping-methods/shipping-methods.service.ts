// shipping-methods.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ShippingMethods, ShippingMethodsDocument } from './shipping-methods.schema';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import PaginationHelper from '~/helpers/pagination.helper';
import { FindPaginateShippingMethod } from './dto';
import { escapeRegex } from '~/helpers';

@Injectable()
export class ShippingMethodsService {
  constructor(
    @InjectModel(ShippingMethods.name) readonly shippingMethodsModel: Model<ShippingMethodsDocument>
  ) {}

  async create(createDto: CreateShippingMethodDto): Promise<AppResponse<ShippingMethods> | Observable<never>> {
    const { name } = createDto;
    const nameTrim = name.trim();

    return {
      content: await this.shippingMethodsModel.create({
        ...createDto,
        name: nameTrim,
      }),
    };
  }

  async findPaginateShippingMethods(dto: FindPaginateShippingMethod): Promise<AppResponse<PaginationResponse<ShippingMethods>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<ShippingMethods, FindPaginateShippingMethod>(dto);

    const { name, isActive } = dto;

    if (name) {
      match.name = { $regex: new RegExp(escapeRegex(name), 'i') };
    }

    if (typeof isActive === 'boolean') {
      match.isActive = isActive;
    }

    const [methods, count] = await Promise.all([
      this.shippingMethodsModel.find(match).sort({ createdAt: 'desc' }).limit(perPage).skip(skip),
      this.shippingMethodsModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({ 
        page: page, 
        data: methods, 
        perPage: perPage, 
        total: count 
      }),
    };
  }

  async findOne(id: string): Promise<AppResponse<ShippingMethods> | Observable<never>> {
    const method = await this.findByField({ _id: id });

    if (method instanceof Observable) {
      return method;
    }

    return {
      content: method,
    };
  }

  async findByField(filter: object): Promise<ShippingMethods | Observable<never>> {
    const method = await this.shippingMethodsModel.findOne(filter);

    if (!method) {
      throw new BadRequestException('Shipping method not exist');
    }

    return method;
  }

  async update(
    id: string,
    updateDto: UpdateShippingMethodDto,
  ): Promise<AppResponse<ShippingMethods | null> | Observable<never>> {
    const method = await this.findByField({ _id: id });

    if (method instanceof Observable) {
      return method;
    }

    const data: any = { ...updateDto };
    if (updateDto.name) {
      data.name = updateDto.name.trim();
    }

    return {
      content: await this.shippingMethodsModel.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true },
      ),
    };
  }

  async remove(id: string) {
    const method = await this.shippingMethodsModel.findOne({
      _id: id,
    });

    if (!method) {
      throw new BadRequestException('Shipping method not found');
    }

    return {
      content: await this.shippingMethodsModel.findByIdAndRemove({ _id: id }),
    };
  }

  async findAll() {
    return {
      content: await this.shippingMethodsModel.find({ isActive: true }),
    };
  }
}