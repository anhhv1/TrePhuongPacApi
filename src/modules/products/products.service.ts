import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products, ProductsDocument } from './products.schema';
import { Model } from 'mongoose';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import { Observable } from 'rxjs';
import PaginationHelper from '~/helpers/pagination.helper';
import { FindPaginateProduct } from './dto';
import { escapeRegex } from '~/helpers';
import { ProductType } from '~/constants';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Products.name) readonly productsModel: Model<ProductsDocument>) {}

  async create(createProductDto: CreateProductDto): Promise<AppResponse<Products> | Observable<never>> {
    const { name } = createProductDto;
    const nameTrim = name.trim();

    return {
      content: await this.productsModel.create({
        ...createProductDto,
        name: nameTrim,
      }),
    };
  }

  async findPaginateProducts(dto: FindPaginateProduct): Promise<AppResponse<PaginationResponse<Products>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Products, FindPaginateProduct>(dto);

    const { name, type } = dto;

    if (name) {
      match.name = { $regex: new RegExp(escapeRegex(name), 'i') };
    }

    if (type) {
      match.type = { $regex: new RegExp(escapeRegex(type), 'i') };
    }

    const [products, count] = await Promise.all([
      this.productsModel
        .find(match)
        .populate('categoryId', 'name') 
        .sort({ createdAt: 'desc' })
        .limit(perPage)
        .skip(skip)
        .lean({ virtuals: true }),
      this.productsModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({ 
        page: page, 
        data: products, 
        perPage: perPage, 
        total: count 
      }),
    };
  }

  async findOne(id: string): Promise<AppResponse<Products> | Observable<never>> {
    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const populatedProduct = await this.productsModel
      .findById(id)
      .populate('categoryId', 'name')
      .lean({ virtuals: true });

    return {
      content: populatedProduct,
    };
  }

  async findByField(filter: object): Promise<Products | Observable<never>> {
    const product = await this.productsModel.findOne(filter).lean({ virtuals: true });

    if (!product) {
      throw new BadRequestException('Product not exist');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<AppResponse<Products | null> | Observable<never>> {
    const { name } = updateProductDto;
    
    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const data: any = { ...updateProductDto };
    
    if (name) {
      data.name = name.trim();
    }

    const updatedProduct = await this.productsModel
      .findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      )
      .populate('categoryId', 'name')
      .lean({ virtuals: true });

    return {
      content: updatedProduct,
    };
  }

  async remove(id: string) {
    const product = await this.productsModel.findOne({
      _id: id,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return {
      content: await this.productsModel.findByIdAndRemove({ _id: id }),
    };
  }

  async findAll() {
    return {
      content: await this.productsModel
        .find()
        .populate('categoryId', 'name')
        .sort({ createdAt: 'desc' })
        .lean({ virtuals: true }),
    };
  }

  async findAllByType() {
    const [
      FACEBOOK_PROFILE,
      FACEBOOK_ADS_ACCOUNT,
      FACEBOOK_PAGES,
      FACEBOOK_BUSINESS_ACCOUNT
    ] = await Promise.all([
      this.productsModel
        .find({ type: ProductType.FACEBOOK_PROFILE })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_ADS_ACCOUNT })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_PAGES })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
      this.productsModel
        .find({ type: ProductType.FACEBOOK_BUSINESS_ACCOUNT })
        .populate('categoryId', 'name')
        .lean({ virtuals: true }),
    ]);

    return {
      content: {
        FACEBOOK_PROFILE,
        FACEBOOK_ADS_ACCOUNT,
        FACEBOOK_PAGES,
        FACEBOOK_BUSINESS_ACCOUNT,
      },
    };
  }

  async findByCategory(categoryId: string) {
    const products = await this.productsModel
      .find({ categoryId })
      .populate('categoryId', 'name')
      .sort({ createdAt: 'desc' })
      .lean({ virtuals: true });

    return {
      content: products,
    };
  }
}