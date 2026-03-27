# Backend Testing Quick Reference

## Run Tests

```bash
# All tests with coverage
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# CI mode (for GitHub Actions)
npm run test:ci
```

## Test Structure

```
backend/tests/
├── setup.ts              # Global test configuration
├── unit/                 # Unit tests (isolated components)
│   ├── sorobanService.test.ts
│   ├── groupsController.test.ts
│   └── webhookService.test.ts
├── integration/          # Integration tests (API endpoints)
│   ├── groups.test.ts
│   ├── webhooks.test.ts
│   └── health.test.ts
├── e2e/                  # End-to-end tests (full workflows)
│   ├── groupLifecycle.test.ts
│   ├── contributionFlow.test.ts
│   └── webhookFlow.test.ts
├── fixtures/             # Mock data and utilities
│   ├── mockData.ts
│   └── mockExpress.ts
└── factories/            # Test data generators
    └── index.ts
```

## Writing Tests

### Unit Test Template

```typescript
import { MyService } from '../../src/services/myService';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
    jest.clearAllMocks();
  });

  describe('myMethod', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = service.myMethod(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Integration Test Template

```typescript
import request from 'supertest';
import app from '../../src/index';

describe('My API Integration Tests', () => {
  describe('GET /api/endpoint', () => {
    it('should return 200', async () => {
      const response = await request(app)
        .get('/api/endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
```

## Coverage Reports

After running tests, view coverage:

```bash
# Open HTML report
open backend/coverage/index.html

# View in terminal
cat backend/coverage/coverage-summary.json
```

## Debugging Tests

```bash
# Run specific test file
npm test -- groupsController.test.ts

# Run specific test by name
npm test -- --testNamePattern="should create a group"

# Run with verbose output
npm test -- --verbose

# Run without coverage (faster)
npm test -- --no-coverage
```

## Common Issues

### Port Already in Use
- Tests automatically use port 3002
- Server doesn't start in test mode (NODE_ENV=test)

### Mock Not Working
- Ensure `jest.clearAllMocks()` in `beforeEach`
- Check mock is imported before the real module

### Timeout Errors
- Increase timeout: `jest.setTimeout(15000)`
- Or per test: `it('test', async () => {...}, 15000)`

## Test Coverage Goals

| Metric     | Current | Target |
|------------|---------|--------|
| Statements | 93.37%  | 70%+   |
| Branches   | 69.04%  | 65%+   |
| Functions  | 97.56%  | 70%+   |
| Lines      | 93.82%  | 70%+   |

✅ All targets met!

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

View results in GitHub Actions tab.
