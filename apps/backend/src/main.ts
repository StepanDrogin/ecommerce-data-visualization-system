import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("BACKEND_PORT", 3000);

  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL", "http://localhost:5173"),
  });

  await app.listen(port);
}

void bootstrap();
