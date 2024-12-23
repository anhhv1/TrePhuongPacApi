import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Categories, CategoriesDocument } from './categories.schema';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import PaginationHelper from '~/helpers/pagination.helper';
import { FindPaginateCategory } from './dto/find-paginate-categories.dto';
import { escapeRegex } from '~/helpers';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) readonly categoriesModel: Model<CategoriesDocument>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<AppResponse<Categories> | Observable<never>> {
    const { name } = createCategoryDto;
    const nameTrim = name.trim();

    return {
      content: await this.categoriesModel.create({
        ...createCategoryDto,
        name: nameTrim,
      }),
    };
  }

  async findPaginateCategories(dto: FindPaginateCategory): Promise<AppResponse<PaginationResponse<Categories>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Categories, FindPaginateCategory>(dto);

    const { name } = dto;

    if (name) {
      match.name = { $regex: new RegExp(escapeRegex(name), 'i') };
    }

    const [categories, count] = await Promise.all([
      this.categoriesModel.find(match).sort({ createdAt: 'desc' }).limit(perPage).skip(skip),
      this.categoriesModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({ 
        page: page, 
        data: categories, 
        perPage: perPage, 
        total: count 
      }),
    };
  }

  async findOne(id: string): Promise<AppResponse<Categories> | Observable<never>> {
    const category = await this.findByField({ _id: id });

    if (category instanceof Observable) {
      return category;
    }

    return {
      content: category,
    };
  }

  async findByField(filter: object): Promise<Categories | Observable<never>> {
    const category = await this.categoriesModel.findOne(filter);

    if (!category) {
      throw new BadRequestException('Category not exist');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<AppResponse<Categories | null> | Observable<never>> {
    const { name } = updateCategoryDto;
    const nameTrim = name.trim();

    const category = await this.findByField({ _id: id });

    if (category instanceof Observable) {
      return category;
    }

    const data: any = {
      ...updateCategoryDto,
      name: nameTrim,
    };

    return {
      content: await this.categoriesModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: data,
        },
        { new: true },
      ),
    };
  }

  async remove(id: string) {
    const category = await this.categoriesModel.findOne({
      _id: id,
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return {
      content: await this.categoriesModel.findByIdAndRemove({ _id: id }),
    };
  }

  async findAll() {
    return {
      content: await this.categoriesModel.find(),
    };
  }
}