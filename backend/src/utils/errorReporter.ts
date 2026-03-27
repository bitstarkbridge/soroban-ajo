import * as Sentry from '@sentry/node';

export class ErrorReporter {
  static captureException(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    Sentry.captureMessage(message, (level as any));
  }

  static setUser(user: { id: string; email?: string }) {
    Sentry.setUser(user);
  }

  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  static withScope(callback: (scope: Sentry.Scope) => void) {
    Sentry.withScope(callback);
  }
}
