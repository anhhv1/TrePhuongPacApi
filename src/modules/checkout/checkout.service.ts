import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import { Model } from 'mongoose';
import { Products, ProductsDocument } from '../products/products.schema';
import { EOrderStatus } from '~/constants';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Products.name) readonly productsModel: Model<ProductsDocument>,
  ) {}

  async create(createCheckoutDto: CreateCheckoutDto) {
    try {
      const { info, products } = createCheckoutDto;

      if (!products || products.length === 0) {
        throw new BadRequestException('Product not exist');
      }

      // Check for existing pending order
      const existingOrder = await this.orderModel.findOne({
        'info.email': info?.email,
        status: EOrderStatus.PENDING,
      });

      if (existingOrder) {
        throw new BadRequestException('Order exist!');
      }

      const transformedProducts = products.map((product) => ({
        productId: product.productId,
        name: product.name,
        price: product.price * (1 - (product.discount || 0) / 100),
        quantity: product.quantity,
        total: product.price * product.quantity * (1 - (product.discount || 0) / 100),
      }));

      // Calculate totals
      const subtotal = transformedProducts.reduce((sum, product) => sum + product.total, 0);

      const shippingFee = info.shippingMethod?.price || 0;
      const discountAmount = info.promotion?.discount || 0;
      const total = subtotal + shippingFee - discountAmount;

      const newOrder = await this.orderModel.create({
        info: {
          userId: info.userId,
          fullname: info.fullname,
          email: info.email,
          phone: info.phone,
          company: info.company || null,
          country: info.country,
          contact: info.contact,
          note: info.note || null,
        },
        products: transformedProducts,
        status: EOrderStatus.PENDING,
        subtotal,
        shippingMethod: info.shippingMethod ? info.shippingMethod._id : null,
        promotion: info.promotion ? info.promotion.code : null,
        total,
      });

      return {
        content: newOrder,
      };
    } catch (error) {
      throw error;
    }
  }
}
