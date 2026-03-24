import * as Sentry from '@sentry/node';
import { Express } from 'express';

export function setupSentryMiddleware(app: Express) {
  // Sentry v8+ handles most things via init and setupExpressErrorHandler
  // But we can add custom middleware here if needed.
}
