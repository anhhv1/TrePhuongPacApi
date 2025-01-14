import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('statistics')
@ApiTags('Statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('orders')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiQuery({ name: 'startDate', type: String })
  @ApiQuery({ name: 'endDate', type: String })
  async getOrderStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return {
      sales: await this.statisticsService.getOrderSalesStats(
        new Date(startDate),
        new Date(endDate)
      ),
      status: await this.statisticsService.getOrderStatusStats(
        new Date(startDate),
        new Date(endDate)
      ),
      growth: await this.statisticsService.getOrderGrowthStats(
        new Date(startDate),
        new Date(endDate)
      )
    };
  }

  @Get('products')
  @ApiOperation({ summary: 'Get product statistics' })
  async getProductStats() {
    return {
      topSelling: await this.statisticsService.getTopSellingProducts(),
      categoryDistribution: await this.statisticsService.getProductCategoryDistribution(),
      inventory: await this.statisticsService.getInventoryStats()
    };
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer statistics' })
  async getCustomerStats() {
    return {
      topCustomers: await this.statisticsService.getTopCustomers(),
      newVsReturning: await this.statisticsService.getCustomerTypeDistribution(),
      growth: await this.statisticsService.getCustomerGrowthStats()
    };
  }

  @Get('promotions')
  @ApiOperation({ summary: 'Get promotion statistics' })
  async getPromotionStats() {
    return {
      usage: await this.statisticsService.getPromotionUsageStats(),
      impact: await this.statisticsService.getPromotionImpactStats(),
      topPromotions: await this.statisticsService.getTopPromotions()
    };
  }

  @Get('shipping')
  @ApiOperation({ summary: 'Get shipping method statistics' })
  async getShippingStats() {
    return {
      methodUsage: await this.statisticsService.getShippingMethodUsage(),
      revenue: await this.statisticsService.getShippingRevenue(),
      distribution: await this.statisticsService.getShippingDistribution()
    };
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get feedback statistics' })
  async getFeedbackStats() {
    return {
      ratings: await this.statisticsService.getRatingDistribution(),
      trends: await this.statisticsService.getFeedbackTrends(),
      summary: await this.statisticsService.getFeedbackSummary()
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export statistics report' })
  @ApiQuery({ name: 'type', enum: ['excel', 'pdf', 'csv'] })
  @ApiQuery({ name: 'startDate', type: String })
  @ApiQuery({ name: 'endDate', type: String })
  async exportStats(
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.statisticsService.exportStatistics(
      type,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get dashboard overview' })
  async getDashboardOverview() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    return {
      revenueOverview: await this.statisticsService.getRevenueOverview(thirtyDaysAgo, today),
      orderOverview: await this.statisticsService.getOrderOverview(thirtyDaysAgo, today),
      productOverview: await this.statisticsService.getProductOverview(),
      customerOverview: await this.statisticsService.getCustomerOverview(thirtyDaysAgo, today)
    };
  }

  @Get('dashboard/charts')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  async getDashboardCharts() {
    return {
      salesChart: await this.statisticsService.getSalesChartData(),
      orderStatusChart: await this.statisticsService.getOrderStatusChartData(),
      topProductsChart: await this.statisticsService.getTopProductsChartData(),
      customerGrowthChart: await this.statisticsService.getCustomerGrowthChartData()
    };
  }
}