import request from 'supertest';
import app from '../../src/index';
import { WebhookService, WebhookEventType } from '../../src/services/webhookService';

describe('E2E: Webhook Integration Flow', () => {
  let webhookId: string;
  let webhookService: WebhookService;

  beforeAll(() => {
    webhookService = new WebhookService();
  });

  it('should register and trigger webhooks', async () => {
    // Register webhook endpoint
    webhookId = webhookService.registerEndpoint({
      url: 'https://webhook.site/test',
      secret: 'test-secret-key',
      events: [WebhookEventType.GROUP_CREATED, WebhookEventType.MEMBER_JOINED],
      enabled: true,
    });

    expect(webhookId).toBeDefined();

    // Create a group (should trigger webhook)
    const groupResponse = await request(app)
      .post('/api/groups')
      .send({
        name: 'Webhook Test Group',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 5,
      })
      .expect(201);

    expect(groupResponse.body.success).toBe(true);

    // Join group (should trigger webhook)
    await request(app)
      .post(`/api/groups/${groupResponse.body.data.groupId}/join`)
      .send({ publicKey: 'GABC123...' })
      .expect(200);

    // Verify webhook stats
    const stats = webhookService.getStats();
    expect(stats.totalEndpoints).toBeGreaterThan(0);
  });

  it('should handle webhook delivery failures gracefully', async () => {
    // Register webhook with invalid URL
    const invalidWebhookId = webhookService.registerEndpoint({
      url: 'https://invalid-url-that-does-not-exist.com/webhook',
      secret: 'test-secret',
      events: [WebhookEventType.GROUP_CREATED],
      enabled: true,
    });

    expect(invalidWebhookId).toBeDefined();

    // Create group (webhook will fail but shouldn't break the flow)
    const response = await request(app)
      .post('/api/groups')
      .send({
        name: 'Test Group',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 5,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
  });

  it('should manage webhook lifecycle', async () => {
    // Register
    const id = webhookService.registerEndpoint({
      url: 'https://example.com/webhook',
      secret: 'secret',
      events: [WebhookEventType.GROUP_CREATED],
      enabled: true,
    });

    // Verify registration
    const endpoint = webhookService.getEndpoint(id);
    expect(endpoint).toBeDefined();

    // Update
    const updated = webhookService.updateEndpoint(id, { enabled: false });
    expect(updated).toBe(true);

    // Verify update
    const updatedEndpoint = webhookService.getEndpoint(id);
    expect(updatedEndpoint?.enabled).toBe(false);

    // Unregister
    const deleted = webhookService.unregisterEndpoint(id);
    expect(deleted).toBe(true);

    // Verify deletion
    const deletedEndpoint = webhookService.getEndpoint(id);
    expect(deletedEndpoint).toBeUndefined();
  });
});
