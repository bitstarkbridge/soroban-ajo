import { Request } from 'express';

export class MockRequest {
  body: any = {};
  params: any = {};
  query: any = {};
  headers: any = {};

  constructor(options: Partial<Request> = {}) {
    Object.assign(this, options);
  }
}

export class MockResponse {
  statusCode = 200;
  body: any = null;
  headers: Record<string, string> = {};

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }

  send(data: any) {
    this.body = data;
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;
    return this;
  }
}

export const mockNext = jest.fn();

export function createMockRequest(options: Partial<Request> = {}): any {
  return new MockRequest(options);
}

export function createMockResponse(): any {
  return new MockResponse();
}
