import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: "ecommerce-data-visualization-system",
      service: "backend",
      status: "ok",
    };
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
