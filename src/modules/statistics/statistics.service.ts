import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { add, sub, format, startOfDay, endOfDay, differenceInDays, isBefore, isAfter } from 'date-fns';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<any>,
    @InjectModel('Product') private readonly productModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  private getDaysBetween(startDate: Date, endDate: Date): Date[] {
    const days = [];
    let currentDate = startOfDay(startDate);
    const lastDate = endOfDay(endDate);

    while (isBefore(currentDate, lastDate)) {
      days.push(currentDate);
      currentDate = add(currentDate, { days: 1 });
    }

    return days;
  }

  async calculateRevenueMetrics(startDate: Date, endDate: Date) {
    const currentPeriodOrders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['RESOLVED', 'PROCESSING'] },
    });

    // Calculate previous period
    const periodDiff = differenceInDays(endDate, startDate);
    const previousStart = sub(startDate, { days: periodDiff });
    const previousEnd = sub(endDate, { days: periodDiff });

    const previousPeriodOrders = await this.orderModel.find({
      createdAt: { $gte: previousStart, $lte: previousEnd },
      status: { $in: ['RESOLVED', 'PROCESSING'] },
    });

    const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);

    const growth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const dailyAverage = currentRevenue / (periodDiff + 1);

    return {
      total: currentRevenue,
      growth,
      average: dailyAverage,
      previousPeriod: previousRevenue,
    };
  }

  async getSalesChartData(startDate: Date, endDate: Date) {
    const days = this.getDaysBetween(startDate, endDate);
    const labels = days.map((day) => format(day, 'yyyy-MM-dd'));

    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const revenueData = new Array(labels.length).fill(0);
    const orderCountData = new Array(labels.length).fill(0);

    orders.forEach((order) => {
      const orderDate = format(order.createdAt, 'yyyy-MM-dd');
      const index = labels.indexOf(orderDate);
      if (index !== -1) {
        revenueData[index] += order.total;
        orderCountData[index]++;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
        },
        {
          label: 'Orders',
          data: orderCountData,
        },
      ],
    };
  }

  async getCustomerGrowthChart(startDate: Date, endDate: Date) {
    const days = this.getDaysBetween(startDate, endDate);
    const labels = days.map((day) => format(day, 'yyyy-MM-dd'));

    const orders = await this.orderModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ createdAt: 1 });

    const newCustomers = new Array(labels.length).fill(0);
    const returningCustomers = new Array(labels.length).fill(0);
    const customerFirstOrder = new Map();

    orders.forEach((order) => {
      const orderDate = format(order.createdAt, 'yyyy-MM-dd');
      const index = labels.indexOf(orderDate);
      const customerId = order.info.userId;

      if (index !== -1) {
        if (!customerFirstOrder.has(customerId)) {
          customerFirstOrder.set(customerId, order.createdAt);
          newCustomers[index]++;
        } else {
          returningCustomers[index]++;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'New Customers',
          data: newCustomers,
        },
        {
          label: 'Returning Customers',
          data: returningCustomers,
        },
      ],
    };
  }

  async getDashboardOverview() {
    const today = new Date();
    const thirtyDaysAgo = sub(today, { days: 30 });

    const [revenue, orders, customers] = await Promise.all([
      this.calculateRevenueMetrics(thirtyDaysAgo, today),
      this.getOrderStats(thirtyDaysAgo, today),
      this.getCustomerStats(thirtyDaysAgo, today),
    ]);

    return {
      periodStart: format(thirtyDaysAgo, 'yyyy-MM-dd'),
      periodEnd: format(today, 'yyyy-MM-dd'),
      metrics: {
        revenue,
        orders,
        customers,
      },
    };
  }
  getCustomerStats(thirtyDaysAgo: Date, today: Date): any {
    throw new Error('Method not implemented.');
  }
  getOrderStats(thirtyDaysAgo: Date, today: Date): any {
    throw new Error('Method not implemented.');
  }

  private getDateRangeFilter(startDate: Date, endDate: Date) {
    return {
      $gte: startOfDay(startDate),
      $lte: endOfDay(endDate),
    };
  }
}
