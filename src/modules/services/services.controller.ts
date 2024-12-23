import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AppResponse } from '~/common/interfaces';
import { Services } from './services.schema';
import { Observable } from 'rxjs';
import { FindCategoryService, FindPaginateService } from './dto';
import { PaginationResponse } from '~/helpers';
import { IdDto } from '~/common/dto';
import { Authorize, Roles } from '~/decorators';
import { EAccountRole } from '~/constants';
import { JwtAuthGuard } from '~/guards/jwtAuth.guard';
import { RolesGuard } from '~/guards/roles.guard';

@ApiTags('[Admin] - Services')
@Roles(EAccountRole.ADMIN)
@Authorize()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto): Promise<AppResponse<Services> | Observable<never>> {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginate services',
  })
  @ApiOkResponse({ type: Services })
  findPaginateProducts(@Query() dto: FindPaginateService): Promise<AppResponse<PaginationResponse<Services>>> {
    return this.servicesService.findPaginateServices(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail services',
  })
  findOne(@Param() id: IdDto): Promise<AppResponse<Services> | Observable<never>> {
    return this.servicesService.findOne(id.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update service',
  })
  update(
    @Param() id: IdDto,
    @Body() updateServicesDto: UpdateServiceDto,
  ): Promise<AppResponse<Services | null> | Observable<never>> {
    return this.servicesService.update(id.id, updateServicesDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete service',
  })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}

@ApiTags('[User] - Services')
@Controller('services')
export class UserServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all service by type',
  })
  findAllByCategory(@Query() dto: FindCategoryService) {
    return this.servicesService.findAllByCategory(dto);
  }
}
