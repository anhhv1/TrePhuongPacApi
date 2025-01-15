import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatisticsService } from '../statistics.service';
import { sub, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class StatisticsCronService {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyStatistics() {
    // Generate statistics for previous day
    const yesterday = sub(new Date(), { days: 1 });
    // await this.statisticsService.generateDailyStats(yesterday);
  }

  @Cron('0 0 1 * *') // Run at midnight on the first day of every month
  async handleMonthlyStatistics() {
    // Generate monthly statistics for previous month
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    const previousMonth = sub(firstDayOfMonth, { days: 1 });
    
    const startDate = startOfMonth(previousMonth);
    const endDate = endOfMonth(previousMonth);

    // await this.statisticsService.generateMonthlyStats(startDate, endDate);
  }

  @Cron('0 0 1 1 *') // Run at midnight on the first day of every year
  async handleYearlyStatistics() {
    // Generate yearly statistics for previous year
    const today = new Date();
    const firstDayOfYear = startOfYear(today);
    const previousYear = sub(firstDayOfYear, { days: 1 });
    
    const startDate = startOfYear(previousYear);
    const endDate = endOfYear(previousYear);

    // await this.statisticsService.generateYearlyStats(startDate, endDate);
  }

  // Additional utility cron jobs

  @Cron('0 */6 * * *') // Run every 6 hours
  async handleIntradayStats() {
    const last6Hours = sub(new Date(), { hours: 6 });
    // await this.statisticsService.generateIntradayStats(last6Hours);
  }

  @Cron('0 0 * * 1') // Run at midnight every Monday
  async handleWeeklyStatistics() {
    const today = new Date();
    const lastWeek = sub(today, { weeks: 1 });
    // await this.statisticsService.generateWeeklyStats(lastWeek);
  }

  @Cron('0 1 * * *') // Run at 1 AM every day
  async handleCleanupOldStats() {
    // Keep only last 12 months of daily stats
    const cutoffDate = sub(new Date(), { months: 12 });
    // await this.statisticsService.cleanupOldStats(cutoffDate);
  }

  // Method to manually trigger stats generation for a date range
  // async generateStatsForRange(startDate: Date, endDate: Date, type: 'daily' | 'monthly' | 'yearly') {
  //   switch (type) {
  //     case 'daily':
  //       await this.statisticsService.generateDailyStats(startDate);
  //       break;
  //     case 'monthly':
  //       await this.statisticsService.generateMonthlyStats(startDate, endDate);
  //       break;
  //     case 'yearly':
  //       await this.statisticsService.generateYearlyStats(startDate, endDate);
  //       break;
  //   }
  // }

  // Method to check if stats exist for a given date
  async verifyStatsExistence(date: Date, type: 'daily' | 'monthly' | 'yearly') {
    // return this.statisticsService.checkStatsExistence(date, type);
  }
}