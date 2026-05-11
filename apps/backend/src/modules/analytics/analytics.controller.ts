import { Controller, Get } from "@nestjs/common";
import type { AnalyticsSummary, ProductAnalyticsItem, SalesPoint } from "@edvs/shared";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  getSummary(): AnalyticsSummary {
    return this.analyticsService.getSummary();
  }

  @Get("sales")
  getSales(): SalesPoint[] {
    return this.analyticsService.getSales();
  }

  @Get("products")
  getProductAnalytics(): ProductAnalyticsItem[] {
    return this.analyticsService.getProductAnalytics();
  }
}
