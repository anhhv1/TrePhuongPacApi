import { Controller, Get, Query } from '@nestjs/common';
import { VnpayService } from './vnpay.service';

@Controller('vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @Get('create_payment_url')
  createPaymentUrl(@Query('orderInfo') orderInfo: string, @Query('amount') amount: number) {
    return this.vnpayService.createPaymentUrl(orderInfo, amount);
  }
  @Get('')
  getBankList() {
    return this.vnpayService.getBankList();
  }
}
