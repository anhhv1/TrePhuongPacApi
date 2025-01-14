import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './order.schema';
import { Model } from 'mongoose';
import { FindPaginateOrder } from './dto';
import PaginationHelper from '~/helpers/pagination.helper';
import { AppResponse, PaginationResponse } from '~/common/interfaces';
import { escapeRegex } from '~/helpers';
import { Observable } from 'rxjs';
import { EOrderStatus } from '~/constants';
import { MailService } from '~/mail/mail.service';
import { PromotionsService } from '../promotions/promotions.service';
import { ShippingMethodsService } from '../shipping-methods/shipping-methods.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) readonly orderModel: Model<OrderDocument>,
    private mailService: MailService,
    private promotionsService: PromotionsService,
    private shippingMethodsService: ShippingMethodsService,
  ) {}

  private async enrichOrderData(order: any) {
    let enrichedOrder = { ...order };

    if (order.promotion) {
      const promotionData = await this.promotionsService.findByCode(order.promotion);
      enrichedOrder.promotionDetails = promotionData && 'content' in promotionData ? promotionData.content : null;
    }

    if (order.shippingMethod) {
      const shippingData = await this.shippingMethodsService.findOne(order.shippingMethod);
      if (shippingData && 'content' in shippingData) {
        enrichedOrder.shippingDetails = shippingData.content;
      } else {
        enrichedOrder.shippingDetails = null;
      }
    }

    return enrichedOrder;
  }

  async findByField(filter: object): Promise<Order | Observable<never>> {
    const order = await this.orderModel.findOne(filter).lean({ virtuals: true });

    if (!order) {
      throw new BadRequestException('Order not exist');
    }

    return await this.enrichOrderData(order);
  }

  async findPaginateOrder(
    dto: FindPaginateOrder,
    account: any = null,
  ): Promise<AppResponse<PaginationResponse<Order>>> {
    const { page, perPage, match, skip } = PaginationHelper.getQueryByPagination<Order, FindPaginateOrder>(dto);

    const { keyword, status } = dto;

    if (account !== null) {
      match['info.email'] = {
        $regex: new RegExp(escapeRegex(account.email), 'i'),
      };
    } else {
      if (keyword) {
        match.$or = [
          { 'info.fullname': { $regex: new RegExp(escapeRegex(keyword), 'i') } },
          { 'info.email': { $regex: new RegExp(escapeRegex(keyword), 'i') } },
        ];
      }

      if (status) {
        match.status = status;
      }
    }

    const [orders, count] = await Promise.all([
      this.orderModel.find(match).sort({ createdAt: 'desc' }).limit(perPage).skip(skip).lean({ virtuals: true }),
      this.orderModel.countDocuments(match),
    ]);

    // Enrich all orders with promotion and shipping details
    const enrichedOrders = await Promise.all(orders.map((order) => this.enrichOrderData(order)));

    return {
      content: PaginationHelper.getPaginationResponse({
        page,
        data: enrichedOrders,
        perPage,
        total: count,
      }),
    };
  }

  async findOne(id: string): Promise<AppResponse<Order> | Observable<never>> {
    const order = await this.orderModel.findById(id).lean({ virtuals: true });

    if (!order) {
      throw new BadRequestException('Order not exist');
    }

    const enrichedOrder = await this.enrichOrderData(order);

    return {
      content: enrichedOrder,
    };
  }

  async update(id: string, status: string): Promise<AppResponse<Order | null> | Observable<never>> {
    const order = await this.findByField({
      _id: id,
    });

    if (order instanceof Observable) {
      return order;
    }

    const data = {
      ...order,
      status: status,
    };

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate({ _id: id }, { $set: data }, { new: true })
      .lean({ virtuals: true });

    const enrichedOrder = await this.enrichOrderData(updatedOrder);

    // if (order.info?.email) {
    //   await this.mailService.confirmOrder(order.info.email);
    // }

    return {
      content: enrichedOrder,
    };
  }

  async remove(id: string) {
    const order = await this.orderModel.findOne({
      _id: id,
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return {
      content: await this.orderModel.findByIdAndRemove({ _id: id }),
    };
  }
}
