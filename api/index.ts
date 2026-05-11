import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import { AppModule } from "../apps/backend/src/app.module";
import { configureApp } from "../apps/backend/src/bootstrap";

let cachedServer: Express | undefined;

async function createServer() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ["error", "warn", "log"],
  });

  configureApp(app);
  await app.init();

  return server;
}

function normalizeApiPath(request: IncomingMessage) {
  if (request.url?.startsWith("/api/")) {
    request.url = request.url.replace(/^\/api/, "");
  }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  cachedServer ??= await createServer();
  normalizeApiPath(request);

  return cachedServer(request, response);
}
