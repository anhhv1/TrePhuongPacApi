import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('[User] - Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  create(@Body() createCheckoutDto: CreateCheckoutDto) {

    
    return this.checkoutService.create(createCheckoutDto);
  }
}
