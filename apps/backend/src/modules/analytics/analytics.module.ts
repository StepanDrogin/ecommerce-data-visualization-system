import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AnalyticsCacheService } from "./analytics-cache.service";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsCacheService],
})
export class AnalyticsModule {}
