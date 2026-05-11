import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

function parseOrigins(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);
  const configuredOrigins = [
    configService.get<string>("FRONTEND_URL", "http://localhost:5173"),
    ...parseOrigins(configService.get<string>("FRONTEND_URLS")),
  ];
  const allowRenderSubdomains = configService.get<string>("ALLOW_RENDER_SUBDOMAINS", "true") === "true";
  const allowVercelSubdomains = configService.get<string>("ALLOW_VERCEL_SUBDOMAINS", "true") === "true";

  app.enableCors({
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (
        !origin ||
        configuredOrigins.includes(origin) ||
        (allowRenderSubdomains && /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) ||
        (allowVercelSubdomains && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin is not allowed: ${origin}`), false);
    },
  });
}
