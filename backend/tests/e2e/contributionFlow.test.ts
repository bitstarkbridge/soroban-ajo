import request from 'supertest';
import app from '../../src/index';

describe('E2E: Contribution and Payout Flow', () => {
  let groupId: string;
  const members = [
    'GABC123...',
    'GDEF456...',
    'GHIJ789...',
  ];

  beforeAll(async () => {
    // Create a test group
    const response = await request(app)
      .post('/api/groups')
      .send({
        name: 'Contribution Test Group',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 3,
      })
      .expect(201);

    groupId = response.body.data.groupId;

    // Add all members
    for (const publicKey of members) {
      await request(app)
        .post(`/api/groups/${groupId}/join`)
        .send({ publicKey })
        .expect(200);
    }
  });

  it('should process contributions from all members', async () => {
    // Each member contributes
    for (const publicKey of members) {
      const response = await request(app)
        .post(`/api/groups/${groupId}/contribute`)
        .send({
          publicKey,
          amount: '100',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transactionId');
    }

    // Verify all transactions
    const transactionsResponse = await request(app)
      .get(`/api/groups/${groupId}/transactions`)
      .expect(200);

    expect(transactionsResponse.body.success).toBe(true);
  });

  it('should track contribution history', async () => {
    // Make multiple contributions
    await request(app)
      .post(`/api/groups/${groupId}/contribute`)
      .send({
        publicKey: members[0],
        amount: '100',
      })
      .expect(200);

    await request(app)
      .post(`/api/groups/${groupId}/contribute`)
      .send({
        publicKey: members[0],
        amount: '50',
      })
      .expect(200);

    // Get transaction history
    const response = await request(app)
      .get(`/api/groups/${groupId}/transactions`)
      .expect(200);

    expect(response.body.data).toBeDefined();
  });

  it('should handle pagination for large transaction lists', async () => {
    // Get first page
    const page1 = await request(app)
      .get(`/api/groups/${groupId}/transactions?page=1&limit=2`)
      .expect(200);

    expect(page1.body.pagination.page).toBe(1);
    expect(page1.body.pagination.limit).toBe(2);

    // Get second page
    const page2 = await request(app)
      .get(`/api/groups/${groupId}/transactions?page=2&limit=2`)
      .expect(200);

    expect(page2.body.pagination.page).toBe(2);
  });
});
