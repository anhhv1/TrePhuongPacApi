// shipping-methods.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ShippingMethodsService } from './shipping-methods.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { FindPaginateShippingMethod } from './dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('shipping-methods')
@ApiTags('[Admin] - shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly shippingMethodsService: ShippingMethodsService) {}

  @Post()
  create(@Body() createShippingMethodDto: CreateShippingMethodDto) {
    return this.shippingMethodsService.create(createShippingMethodDto);
  }

  @Get()
  findAll() {
    return this.shippingMethodsService.findAll();
  }

  @Get('paginate')
  findPaginate(@Query() query: FindPaginateShippingMethod) {
    return this.shippingMethodsService.findPaginateShippingMethods(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingMethodsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShippingMethodDto: UpdateShippingMethodDto) {
    return this.shippingMethodsService.update(id, updateShippingMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingMethodsService.remove(id);
  }
}