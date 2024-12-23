import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, FindPaginateCategory, UpdateCategoryDto } from './dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('categories')
@ApiTags('[Admin] - Category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('paginate')
  findPaginate(@Query() query: FindPaginateCategory) {
    return this.categoriesService.findPaginateCategories(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}