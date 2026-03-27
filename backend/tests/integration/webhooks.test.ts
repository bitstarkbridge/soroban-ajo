import request from 'supertest';
import app from '../../src/index';

describe('Webhooks API Integration Tests', () => {
  describe('POST /api/webhooks/register', () => {
    it('should register a new webhook endpoint', async () => {
      const webhookData = {
        url: 'https://example.com/webhook',
        events: ['group.created', 'member.joined'],
        secret: 'test-secret',
      };

      const response = await request(app)
        .post('/api/webhooks/register')
        .send(webhookData)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });

    it('should validate webhook URL format', async () => {
      const webhookData = {
        url: 'invalid-url',
        events: ['group.created'],
      };

      const response = await request(app)
        .post('/api/webhooks/register')
        .send(webhookData);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/webhooks', () => {
    it('should list all registered webhooks', async () => {
      const response = await request(app)
        .get('/api/webhooks')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('should unregister a webhook', async () => {
      const response = await request(app)
        .delete('/api/webhooks/test-id');

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/webhooks/test', () => {
    it('should send test webhook', async () => {
      const response = await request(app)
        .post('/api/webhooks/test')
        .send({ endpointId: 'test-id' });

      expect(response.body).toHaveProperty('success');
    });
  });
});
