import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

function parsePort(value: string | number | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = parsePort(process.env.PORT ?? configService.get<string>("BACKEND_PORT"), 3000);
  const configuredOrigins = [
    configService.get<string>("FRONTEND_URL", "http://localhost:5173"),
    ...parseOrigins(configService.get<string>("FRONTEND_URLS")),
  ];
  const allowRenderSubdomains = configService.get<string>("ALLOW_RENDER_SUBDOMAINS", "true") === "true";

  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (
        !origin ||
        configuredOrigins.includes(origin) ||
        (allowRenderSubdomains && /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin is not allowed: ${origin}`), false);
    },
  });

  await app.listen(port, "0.0.0.0");
}

void bootstrap();
