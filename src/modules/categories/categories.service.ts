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
  constructor(@InjectModel(Categories.name) readonly categoriesModel: Model<CategoriesDocument>) {}

  private generateSlug(name: string): string {
    return name
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove any remaining non-alphanumeric characters except hyphens
      .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single hyphen
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<AppResponse<Categories> | Observable<never>> {
    const { name, image } = createCategoryDto;
    const nameTrim = name.trim();
    const slug = this.generateSlug(nameTrim);

    const existingSlug = await this.categoriesModel.findOne({ slug });
    if (existingSlug) {
      throw new BadRequestException('Category with similar name already exists');
    }

    return {
      content: await this.categoriesModel.create({
        ...createCategoryDto,
        name: nameTrim,
        slug,
        image: image || '',
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
        total: count,
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
    const { name, image, slug } = updateCategoryDto;
    const nameTrim = name.trim();
    const slug2 = this.generateSlug(nameTrim);

    const category = await this.findByField({ _id: id });

    if (category instanceof Observable) {
      return category;
    }

    // Check if new slug already exists (excluding current category)
    const existingSlug = await this.categoriesModel.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existingSlug) {
      throw new BadRequestException('Category with similar name already exists');
    }

    const data = {
      ...updateCategoryDto,
      name: name,
      slug: slug ? slug : slug2,
      image: image || category.image, // Keep existing image if no new one provided
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
