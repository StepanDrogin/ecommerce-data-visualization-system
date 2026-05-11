import { Controller, Get, Query } from "@nestjs/common";
import type {
  AnalyticsDashboardResponse,
  AnalyticsFilters,
  AnalyticsSummary,
  CategoryAnalyticsItem,
  ProductAnalyticsItem,
  SalesPoint,
} from "@edvs/shared";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  getDashboard(@Query() filters: AnalyticsFilters): AnalyticsDashboardResponse {
    return this.analyticsService.getDashboard(filters);
  }

  @Get("summary")
  getSummary(@Query() filters: AnalyticsFilters): AnalyticsSummary {
    return this.analyticsService.getSummary(filters);
  }

  @Get("sales")
  getSales(@Query() filters: AnalyticsFilters): SalesPoint[] {
    return this.analyticsService.getSales(filters);
  }

  @Get("products")
  getProductAnalytics(@Query() filters: AnalyticsFilters): ProductAnalyticsItem[] {
    return this.analyticsService.getProductAnalytics(filters);
  }

  @Get("categories")
  getCategoryAnalytics(@Query() filters: AnalyticsFilters): CategoryAnalyticsItem[] {
    return this.analyticsService.getCategoryAnalytics(filters);
  }
}
