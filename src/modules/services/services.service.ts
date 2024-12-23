import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import { Observable } from 'rxjs';
import { Services, ServicesDocument } from './services.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import PaginationHelper from '~/helpers/pagination.helper';
import { escapeRegex } from '~/helpers';
import { FindCategoryService, FindPaginateService } from './dto';
import { EServiceCategory } from '~/constants';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Services.name) readonly servicesModel: Model<ServicesDocument>) {}

  async create(createServiceDto: CreateServiceDto): Promise<AppResponse<Services> | Observable<never>> {
    return {
      content: await this.servicesModel.create({
        ...createServiceDto,
      }),
    };
  }

  async findPaginateServices(dto: FindPaginateService): Promise<AppResponse<PaginationResponse<Services>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Services, FindPaginateService>(dto);

    const { keyword, type, category } = dto;

    if (keyword) {
      match.title = { $regex: new RegExp(escapeRegex(keyword), 'i') };
    }

    if (type) {
      match.type = { $regex: new RegExp(escapeRegex(type), 'i') };
    }

    if (category) {
      match.category = { $regex: new RegExp(escapeRegex(category), 'i') };
    }
    const [services, count] = await Promise.all([
      this.servicesModel.find(match).sort({ createdAt: 'desc' }).limit(perPage).skip(skip),
      this.servicesModel.countDocuments(match),
    ]);
    return {
      content: PaginationHelper.getPaginationResponse({ page: page, data: services, perPage: perPage, total: count }),
    };
  }

  async findOne(id: string): Promise<AppResponse<Services> | Observable<never>> {
    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    return {
      content: product,
    };
  }

  async findByField(filter: object): Promise<Services | Observable<never>> {
    const product = await this.servicesModel.findOne(filter);

    if (!product) {
      throw new BadRequestException('Product not exist');
    }

    return product;
  }

  async update(
    id: string,
    UpdateServiceDto: UpdateServiceDto,
  ): Promise<AppResponse<Services | null> | Observable<never>> {
    const {} = UpdateServiceDto;

    const product = await this.findByField({ _id: id });

    if (product instanceof Observable) {
      return product;
    }

    const data: any = {
      ...UpdateServiceDto,
    };

    return {
      content: await this.servicesModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: data,
        },
        { new: true },
      ),
    };
  }

  async remove(id: string) {
    const product = await this.servicesModel.findOne({
      _id: id,
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    return {
      content: await this.servicesModel.findByIdAndRemove({ _id: id }),
    };
  }

  async findAllByCategory(dto: FindCategoryService) {
    // EServiceCategory
    const { type } = dto;
    const BUSINESS_MANAGER = await this.servicesModel.find({ category: EServiceCategory.BUSINESS_MANAGER, type: type });
    const FANPAGE = await this.servicesModel.find({ category: EServiceCategory.FANPAGE, type: type });
    const PERSONAL_ACCOUNT = await this.servicesModel.find({ category: EServiceCategory.PERSONAL_ACCOUNT, type: type });
    const PROFILE = await this.servicesModel.find({ category: EServiceCategory.PROFILE, type: type });

    return {
      content: {
        BUSINESS_MANAGER: BUSINESS_MANAGER,
        FANPAGE: FANPAGE,
        PERSONAL_ACCOUNT: PERSONAL_ACCOUNT,
        PROFILE: PROFILE,
      },
    };
  }
}
