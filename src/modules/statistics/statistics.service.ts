import { Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { sub, format, differenceInDays } from 'date-fns';
import * as Excel from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Products, ProductsDocument } from '../products/products.schema';
import { Account } from '../account/account.schema';
import { Feedbacks, FeedbacksDocument } from '../feedbacks/feedbacks.schema';
import { Order, OrderDocument } from '../orders/order.schema';
import { ShippingMethods, ShippingMethodsDocument } from '../shipping-methods/shipping-methods.schema';
import { Response } from 'express';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Order.name) readonly orderModel: Model<OrderDocument>,
    @InjectModel(Products.name) readonly productModel: Model<ProductsDocument>,
    @InjectModel(Account.name) private userModel: Model<Account>,
    @InjectModel(Feedbacks.name) private feedbackModel: Model<FeedbacksDocument>,
    @InjectModel(ShippingMethods.name) readonly shippingMethodsModel: Model<ShippingMethodsDocument>,
  ) {}

  async getOrderSalesStats(startDate: Date, endDate: Date) {
    const orders = await this.orderModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['RESOLVED', 'PROCESSING'] },
      })
      .sort({ createdAt: 1 });

    const dailySales = {};
    var total = 0;
    orders.map((order) => {
      const date = format(order.createdAt, 'yyyy-MM-dd');
      dailySales[date] = (dailySales[date] || 0) + order.total;
      total += order.total;
    });

    return {
      total: total,
      daily: dailySales,
    };
  }

  async getOrderStatusStats(startDate: Date, endDate: Date) {
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }

  async getOrderGrowthStats(startDate: Date, endDate: Date) {
    const currentOrders = await this.getOrderSalesStats(startDate, endDate);
    const previousPeriod = sub(startDate, { days: differenceInDays(endDate, startDate) });
    const previousOrders = await this.getOrderSalesStats(previousPeriod, startDate);
    if (previousOrders.total === 0) {
      return {
        current: currentOrders.total,
        previous: 0,
        growth: 100,
        previousPeriod: previousPeriod,
      };
    }
    return {
      current: currentOrders.total,
      previous: previousOrders.total,
      growth: ((currentOrders.total - previousOrders.total) / previousOrders.total) * 100,
      previousPeriod: previousPeriod,
    };
  }

  async getTopSellingProducts() {
    const orders = await this.orderModel.find({ status: 'RESOLVED' });
    const productSales = {};

    orders.forEach((order) => {
      order.products.forEach((product) => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            id: product.productId,
            name: product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[product.productId].quantity += product.quantity;
        productSales[product.productId].revenue += product.total;
      });
    });

    return Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  async getProductCategoryDistribution() {
    const products = await this.productModel.find().populate('categoryId');
    const distribution = {};

    products.map((product, i) => {
      const category = product.categoryId?.name;
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count,
      percentage: ((count as number) / products.length) * 100,
    }));
  }

  async getInventoryStats() {
    const products = await this.productModel.find();
    return {
      total: products.length,
      inStock: products.filter((p) => p.quantity > 0).length,
      outOfStock: products.filter((p) => p.quantity === 0).length,
      lowStock: products.filter((p) => p.quantity > 0 && p.quantity <= 10).length,
    };
  }

  async getTopCustomers() {
    const orders = await this.orderModel.find({ status: 'RESOLVED' }).populate('info.userId', 'fullname email');

    const customerStats = {};
    orders.forEach((order) => {
      const customerId = order.info.userId;
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          info: order.info,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      customerStats[customerId].orderCount++;
      customerStats[customerId].totalSpent += order.total;
    });

    return Object.values(customerStats)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  async getCustomerGrowthStats() {
    const today = new Date();
    const lastMonth = sub(today, { months: 1 });
    const twoMonthsAgo = sub(today, { months: 2 });

    const [currentCustomers, previousCustomers] = await Promise.all([
      this.getUniqueCustomers(lastMonth, today),
      this.getUniqueCustomers(twoMonthsAgo, lastMonth),
    ]);

    if (previousCustomers === 0) {
      return {
        current: currentCustomers,
        previous: 0,
        growth: 100,
      };
    }
    return {
      current: currentCustomers,
      previous: previousCustomers,
      growth: ((currentCustomers - previousCustomers) / previousCustomers) * 100,
    };
  }

  private async getUniqueCustomers(startDate: Date, endDate: Date) {
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    return new Set(orders.map((order) => order.info.userId.toString())).size;
  }

  async getPromotionUsageStats() {
    const orders = await this.orderModel.find({ promotion: { $ne: null } });
    const promotionUsage = {};

    orders.forEach((order) => {
      const code = order.promotion;
      if (!promotionUsage[code]) {
        promotionUsage[code] = {
          code,
          usageCount: 0,
          totalDiscount: 0,
        };
      }
      promotionUsage[code].usageCount++;
      promotionUsage[code].totalDiscount += order.subtotal - order.total;
    });

    return Object.values(promotionUsage);
  }

  async getPromotionImpactStats() {
    const orders = await this.orderModel.find().sort({ createdAt: -1 });
    return {
      ordersWithPromo: orders.filter((o) => o.promotion).length,
      ordersWithoutPromo: orders.filter((o) => !o.promotion).length,
      averageDiscountAmount: await this.calculateAverageDiscount(orders),
    };
  }

  private async calculateAverageDiscount(orders) {
    const ordersWithPromo = orders.filter((o) => o.promotion);
    if (ordersWithPromo.length === 0) return 0;

    const totalDiscount = ordersWithPromo.reduce(
      (sum: number, order: { subtotal: number; total: number }) => sum + (order.subtotal - order.total),
      0,
    );
    return totalDiscount / ordersWithPromo.length;
  }

  async getTopPromotions() {
    const promotionStats = await this.getPromotionUsageStats();
    return promotionStats.sort((a: any, b: any) => b.usageCount - a.usageCount).slice(0, 5);
  }

  async getShippingMethodUsage() {
    const orders = await this.orderModel.find({ shippingMethod: { $ne: null } });
    const methodUsage = {};

    orders.forEach((order) => {
      const methodId = order.shippingMethod;
      if (!methodUsage[methodId]) {
        methodUsage[methodId] = {
          methodId,
          count: 0,
        };
      }
      methodUsage[methodId].count++;
    });

    return Object.values(methodUsage);
  }

  async exportStatistics(type: string, startDate: Date, endDate: Date, @Res() res: Response) {
    const data = await this.gatherExportData(startDate, endDate);
    switch (type) {
      case 'excel':
        const excelFile = await this.exportToExcel(data);
        res.set(excelFile.headers); // Set the headers for the response
        return res.send(excelFile.data); // Send the file data
      case 'pdf':
        const pdfFile = await this.exportToPDF(data);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="statistics.pdf"');
        return res.send(pdfFile);
      case 'csv':
        const csvFile = await this.exportToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="statistics.csv"');
        return res.send(csvFile);
      default:
        throw new Error('Unsupported export type');
    }
  }

  private async gatherExportData(startDate: Date, endDate: Date) {
    const [promotionStats, shippingStats, orderStats] = await Promise.all([
      this.getPromotionUsageStats(),
      this.getShippingMethodUsage(),
      this.getOrderSalesStats(startDate, endDate),
    ]);

    return {
      promotionStats,
      shippingStats,
      orderStats,
    };
  }

  private async exportToExcel(data: any) {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Data Sheet');

    worksheet.columns = [
      { header: 'Promotion Code', key: 'code', width: 20 },
      { header: 'Usage Count', key: 'usageCount', width: 15 },
      { header: 'Total Discount', key: 'totalDiscount', width: 20 },
    ];

    data.promotionStats.forEach((promotion) => {
      worksheet.addRow({
        code: promotion.code,
        usageCount: promotion.usageCount,
        totalDiscount: promotion.totalDiscount,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      filename: 'statistics.xlsx',
      data: buffer,
      headers: {
        'Content-Disposition': 'attachment; filename="statistics.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }

  private async exportToPDF(data: any) {
    const doc = new PDFDocument();
    let buffers: Buffer[] = [];

    // Collect the PDF content in a buffer
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);

      return pdfBuffer;
    });

    doc.fontSize(16).text('Statistics Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('Promotion Usage Stats', { underline: true });
    doc.moveDown();

    data.promotionStats.forEach((promotion) => {
      doc.text(`Promotion Code: ${promotion.code}`, { continued: true });
      doc.text(` Usage Count: ${promotion.usageCount}`, { continued: true });
      doc.text(` Total Discount: ${promotion.totalDiscount}`);
    });

    doc.end();

  }

  private async exportToCSV(data: any) {
    const rows = [
      ['Promotion Code', 'Usage Count', 'Total Discount'], // Header row
      ...data.promotionStats.map((promotion) => [promotion.code, promotion.usageCount, promotion.totalDiscount]),
    ];

    // Convert rows to CSV format
    const csvContent = rows.map((row) => row.join(',')).join('\n');

    // Return the CSV content as a buffer or as a string to be downloaded
    return Buffer.from(csvContent, 'utf-8');
  }

  // Chart Data
  async getOrderStatusChartData() {
    const orders = await this.orderModel.find();
    return this.prepareOrderStatusChartData(orders);
  }

  async getTopProductsChartData() {
    const topProducts = await this.getTopSellingProducts();
    return this.prepareTopProductsChartData(topProducts);
  }

  private prepareOrderStatusChartData(orders: any[]) {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      data: Object.values(statusCounts),
    };
  }

  private prepareTopProductsChartData(products: any[]) {
    return {
      labels: products.map((p) => p.name),
      data: products.map((p) => p.revenue),
    };
  }
}
