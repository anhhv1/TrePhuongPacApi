// promotions.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { FindPaginatePromotion } from './dto/find-paginate-promotion.dto';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'The promotion has been successfully created.' })
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active promotions' })
  findAll() {
    return this.promotionsService.findActivePromotions();
  }

  @Get('paginate')
  @ApiOperation({ summary: 'Get paginated promotions' })
  findPaginate(@Query() query: FindPaginatePromotion) {
    return this.promotionsService.findPaginatePromotions(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotion by id' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a promotion by code' })
  findByCode(@Param('code') code: string) {
    return this.promotionsService.findByCode(code);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promotion code with order amount' })
  async validatePromotion(
    @Body('code') code: string,
    @Body('orderAmount') orderAmount: number
  ) {
    await this.promotionsService.validatePromotion(code, orderAmount);
    const discount = await this.promotionsService.calculateDiscount(code, orderAmount);
    
    return {
      content: {
        isValid: true,
        discount
      }
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a promotion' })
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a promotion' })
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}