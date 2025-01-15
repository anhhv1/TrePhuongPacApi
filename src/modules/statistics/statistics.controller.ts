import { Controller, Get, Query, Res } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('statistics')
@ApiTags('Statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiQuery({
    name: 'startDate',
    type: String,
    example: '2025-01-01',
    description: 'Start date in format YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    example: '2025-01-31',
    description: 'End date in format YYYY-MM-DD',
  })
  async getOrderStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const datas = {
      sales: await this.statisticsService.getOrderSalesStats(new Date(startDate), new Date(endDate)),
      status: await this.statisticsService.getOrderStatusStats(new Date(startDate), new Date(endDate)),
      growth: await this.statisticsService.getOrderGrowthStats(new Date(startDate), new Date(endDate)),
    };

    return {
      content: datas,
    };
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product statistics' })
  async getProductStats() {
    return {
      content: {
        topSelling: await this.statisticsService.getTopSellingProducts(),
        categoryDistribution: await this.statisticsService.getProductCategoryDistribution(),
        inventory: await this.statisticsService.getInventoryStats(),
      },
    };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer statistics' })
  async getCustomerStats() {
    return {
      content: {
        topCustomers: await this.statisticsService.getTopCustomers(),
        growth: await this.statisticsService.getCustomerGrowthStats(),
      },
    };
  }

  @Get('promotions')
  @ApiOperation({ summary: 'Get promotion statistics' })
  async getPromotionStats() {
    return {
      content: {
        usage: await this.statisticsService.getPromotionUsageStats(),
        impact: await this.statisticsService.getPromotionImpactStats(),
        topPromotions: await this.statisticsService.getTopPromotions(),
      },
    };
  }

  @Get('shipping')
  @ApiOperation({ summary: 'Get shipping method statistics' })
  async getShippingStats() {
    return {
      content: {
        methodUsage: await this.statisticsService.getShippingMethodUsage(),
      },
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export statistics report' })
  @ApiQuery({ name: 'type', enum: ['excel', 'pdf', 'csv'] })
  @ApiQuery({
    name: 'startDate',
    type: String,
    example: '2025-01-01',
    description: 'Start date in format YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    type: String,
    example: '2025-01-31',
    description: 'End date in format YYYY-MM-DD',
  })
  async exportStats(
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    await this.statisticsService.exportStatistics(type, new Date(startDate), new Date(endDate),res);
    
    return {
      message: 1,
    };
  }

  @Get('dashboard/charts')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  async getDashboardCharts() {
    return {
      content: {
        orderStatusChart: await this.statisticsService.getOrderStatusChartData(),
        topProductsChart: await this.statisticsService.getTopProductsChartData(),
      },
    };
  }
}
