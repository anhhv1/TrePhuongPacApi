import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Promotions, PromotionsDocument } from './promotions.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import PaginationHelper from '~/helpers/pagination.helper';
import { escapeRegex } from '~/helpers';
import { FindPaginatePromotion } from './dto/find-paginate-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotions.name) readonly promotionsModel: Model<PromotionsDocument>
  ) {}

  async create(createDto: CreatePromotionDto): Promise<AppResponse<Promotions> | Observable<never>> {
    // Check if code already exists
    const existingPromotion = await this.promotionsModel.findOne({ 
      code: createDto.code.toUpperCase().trim() 
    });

    if (existingPromotion) {
      throw new BadRequestException('Promotion code already exists');
    }

    // Validate dates
    if (new Date(createDto.startDate) > new Date(createDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return {
      content: await this.promotionsModel.create(createDto),
    };
  }

  async findPaginatePromotions(dto: FindPaginatePromotion): Promise<AppResponse<PaginationResponse<Promotions>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Promotions, FindPaginatePromotion>(dto);

    const { code, isActive, isValid } = dto;

    if (code) {
      match.code = { $regex: new RegExp(escapeRegex(code), 'i') };
    }

    if (typeof isActive === 'boolean') {
      match.isActive = isActive;
    }

    if (isValid) {
      const now = new Date();
      match.startDate = { $lte: now };
      match.endDate = { $gte: now };
      match.isActive = true;
      match.$or = [
        { usageLimit: -1 },
        {
          $expr: {
            $or: [
              { $eq: ["$usageLimit", -1] },
              { $lt: ["$usageCount", "$usageLimit"] }
            ]
          }
        }
      ];
    }

    const [promotions, count] = await Promise.all([
      this.promotionsModel
        .find(match)
        .sort({ createdAt: 'desc' })
        .limit(perPage)
        .skip(skip)
        .lean({ virtuals: true }),
      this.promotionsModel.countDocuments(match),
    ]);

    return {
      content: PaginationHelper.getPaginationResponse({ 
        page, 
        data: promotions, 
        perPage, 
        total: count 
      }),
    };
  }


  async findOne(id: string): Promise<AppResponse<Promotions> | Observable<never>> {
    const promotion = await this.findByField({ _id: id });

    if (promotion instanceof Observable) {
      return promotion;
    }

    return {
      content: promotion,
    };
  }

  async findByCode(code: string): Promise<AppResponse<Promotions> | Observable<never>> {
    const promotion = await this.findByField({ 
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (promotion instanceof Observable) {
      return promotion;
    }

    // Check if promotion is valid
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new BadRequestException('Promotion is not valid at this time');
    }

    // Check usage limit
    if (promotion.usageLimit !== -1 && promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestException('Promotion usage limit reached');
    }

    return {
      content: promotion,
    };
  }

  async findByField(filter: object): Promise<Promotions | Observable<never>> {
    const promotion = await this.promotionsModel.findOne(filter).lean({ virtuals: true });

    if (!promotion) {
      throw new BadRequestException('Promotion not exist');
    }

    return promotion;
  }

  async update(
    id: string,
    updateDto: UpdatePromotionDto,
  ): Promise<AppResponse<Promotions | null> | Observable<never>> {
    const promotion = await this.findByField({ _id: id });

    if (promotion instanceof Observable) {
      return promotion;
    }

    // Check code uniqueness if updating code
    if (updateDto.code) {
      const existingPromotion = await this.promotionsModel.findOne({ 
        code: updateDto.code.toUpperCase().trim(),
        _id: { $ne: id }
      });

      if (existingPromotion) {
        throw new BadRequestException('Promotion code already exists');
      }
    }

    // Validate dates if updating
    if (updateDto.startDate && updateDto.endDate) {
      if (new Date(updateDto.startDate) > new Date(updateDto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const data = { ...updateDto };
    if (data.code) {
      data.code = data.code.toUpperCase().trim();
    }

    return {
      content: await this.promotionsModel.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      ).lean({ virtuals: true }),
    };
  }

  async remove(id: string) {
    const promotion = await this.promotionsModel.findOne({
      _id: id,
    });

    if (!promotion) {
      throw new BadRequestException('Promotion not found');
    }

    return {
      content: await this.promotionsModel.findByIdAndRemove({ _id: id }),
    };
  }

  async incrementUsage(id: string) {
    return await this.promotionsModel.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    ).lean({ virtuals: true });
  }
  async validatePromotion(code: string, orderAmount: number): Promise<boolean> {
    try {
      const result = await this.findByCode(code);
      
      if (result instanceof Observable) {
        throw new BadRequestException('Invalid response type');
      }

      const promotion = result.content;
      
      if (orderAmount < promotion.minimumOrder) {
        throw new BadRequestException('Order amount does not meet minimum requirement');
      }

      return true;
    } catch (err) {
      if (err instanceof Error) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException('An error occurred');
    }
  }

  async calculateDiscount(code: string, orderAmount: number): Promise<number> {
    const result = await this.findByCode(code);
    
    if (result instanceof Observable) {
      throw new BadRequestException('Invalid response type');
    }

    const promotion = result.content;
    let discount = 0;
    
    if (promotion.type === 'PERCENTAGE') {
      discount = (orderAmount * promotion.value) / 100;
    } else {
      discount = promotion.value;
    }

    if (promotion.maximumDiscount && discount > promotion.maximumDiscount) {
      discount = promotion.maximumDiscount;
    }

    return discount;
  }

  async findActivePromotions() {
    const now = new Date();
    
    const promotions = await this.promotionsModel.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: -1 },
        {
          $expr: {
            $lt: ["$usageCount", "$usageLimit"]
          }
        }
      ]
    })
    .sort({ createdAt: 'desc' })
    .lean({ virtuals: true });

    return {
      content: promotions
    };
  }
}