// statistics.interface.ts
export interface RevenueSummary {
  total: number;
  growth: number;
  average: number;
  forecast: number;
}

export interface OrderSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  averageValue: number;
}

export interface ProductSummary {
  total: number;
  outOfStock: number;
  lowStock: number;
  topSelling: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
}

export interface CustomerSummary {
  total: number;
  new: number;
  returning: number;
  topCustomers: Array<{
    id: string;
    name: string;
    orders: number;
    spent: number;
  }>;
}

export interface SalesChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

export interface StatusChartData {
  labels: string[];
  data: number[];
}

export interface CategoryDistribution {
  categoryId: string;
  name: string;
  count: number;
  percentage: number;
}

export interface PromotionStats {
  code: string;
  usageCount: number;
  totalDiscount: number;
  averageDiscount: number;
  redemptionRate: number;
}

export interface ShippingStats {
  methodId: string;
  name: string;
  usageCount: number;
  revenue: number;
  averageTime: number;
}

export interface FeedbackSummary {
  totalCount: number;
  averageRating: number;
  distribution: {
    [key: number]: number;
  };
  recentFeedback: Array<{
    id: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
}

// statistics.dto.ts
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DateRangeDto {
  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}

export class ExportStatsDto extends DateRangeDto {
  @ApiProperty({ enum: ['excel', 'pdf', 'csv'] })
  @IsEnum(['excel', 'pdf', 'csv'])
  type: string;
}

export class StatisticsQueryDto {
  @ApiProperty({ enum: ['daily', 'monthly', 'yearly'] })
  @IsEnum(['daily', 'monthly', 'yearly'])
  type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['revenue', 'orders', 'products', 'customers'])
  metric?: string;
}

// statistics-response.dto.ts
export class DashboardOverviewDto {
  @ApiProperty()
  revenue: RevenueSummary;

  @ApiProperty()
  orders: OrderSummary;

  @ApiProperty()
  products: ProductSummary;

  @ApiProperty()
  customers: CustomerSummary;
}

export class ChartDataDto {
  @ApiProperty()
  sales: SalesChartData;

  @ApiProperty()
  orderStatus: StatusChartData;

  @ApiProperty()
  categories: CategoryDistribution[];

  @ApiProperty()
  customerGrowth: SalesChartData;
}
