import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import { Model } from 'mongoose';
import { Products, ProductsDocument } from '../products/products.schema';
import { EOrderStatus } from '~/constants';
// import { MailService } from '~/mail/mail.service';
@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Products.name) readonly productsModel: Model<ProductsDocument>,
    // private mailService: MailService,
  ) { }

  async create(createCheckoutDto: CreateCheckoutDto) {
    const { info, products } = createCheckoutDto;

    if (products.length === 0) {
      throw new BadRequestException('Product not exist');
    }

    const order = await this.orderModel.findOne({ email: info?.email, status: EOrderStatus.PENDING });

    if (order) {
      throw new BadRequestException('Order exist!');
    }

    // await this.mailService.recieveOrder(info?.email);

    const orderRes = await this.orderModel.create({
      userId: info?.userId,
      fullname: info?.fullname,
      email: info?.email,
      products: products,
    });

    return {
      content: orderRes,
    };
  }
}
