import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';

import { AppResponse } from '~/common/interfaces';
import { PaginationResponse } from '~/helpers';
import { Products } from './products.schema';
import { ProductsService } from './products.service';
import { FindPaginateProduct, UpdateProductDto, CreateProductDto } from './dto';
import { IdDto } from '~/common/dto';
import { Authorize, Roles } from '~/decorators';
import { EAccountRole } from '~/constants';
import { JwtAuthGuard } from '~/guards/jwtAuth.guard';
import { RolesGuard } from '~/guards/roles.guard';

@ApiTags('[Admin] - Products')
@Roles(EAccountRole.ADMIN)
@Authorize()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    description: 'Create a products',
    summary: 'Create a products',
  })
  @ApiOkResponse({ type: Products })
  create(@Body() createProductDto: CreateProductDto): Promise<AppResponse<Products> | Observable<never>> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginate products',
  })
  @ApiOkResponse({ type: Products })
  findPaginateProducts(@Query() dto: FindPaginateProduct): Promise<AppResponse<PaginationResponse<Products>>> {
    return this.productsService.findPaginateProducts(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail products',
  })
  findOne(@Param() id: IdDto): Promise<AppResponse<Products> | Observable<never>> {
    return this.productsService.findOne(id.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Product',
  })
  update(
    @Param() id: IdDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<AppResponse<Products | null> | Observable<never>> {
    return this.productsService.update(id.id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post("import-data")
  async importData() {
    const basePath = '../TrePhuongPacApi/src/assets';
    return this.productsService.importData(basePath);
  }   
}

@ApiTags('[User] - Products')
@Controller('products')
export class UserProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('all')
  @ApiOperation({
    operationId: 'getAllProducts',
    description: 'get all products',
    summary: 'Get all a products',
  })
  @ApiOkResponse({ type: Products, isArray: true })
  findAll() {
    return this.productsService.findAll();
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Detail products',
  })
  findOne(@Param() id: IdDto): Promise<AppResponse<Products> | Observable<never>> {
    return this.productsService.findOne(id.id);
  }
  
  @Get('category/:categoryId')
  @ApiOperation({
    operationId: 'getProductsByCategory',
    description: 'Get products by category ID',
    summary: 'Get products by category',
  })
  @ApiOkResponse({ type: Products, isArray: true })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }
}
