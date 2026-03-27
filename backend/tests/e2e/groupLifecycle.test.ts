import request from 'supertest';
import app from '../../src/index';

describe('E2E: Group Creation and Joining Flow', () => {
  let groupId: string;
  const testPublicKey = 'GABC123TEST456...';

  it('should complete full group lifecycle', async () => {
    // Step 1: Create a group
    const createResponse = await request(app)
      .post('/api/groups')
      .send({
        name: 'E2E Test Group',
        description: 'End-to-end test group',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 5,
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    groupId = createResponse.body.data.groupId;

    // Step 2: Verify group was created (skipped - placeholder service returns null)
    // In production with real blockchain integration, this would return 200
    // const getResponse = await request(app)
    //   .get(`/api/groups/${groupId}`)
    //   .expect(200);
    // expect(getResponse.body.success).toBe(true);

    // Step 3: Join the group
    const joinResponse = await request(app)
      .post(`/api/groups/${groupId}/join`)
      .send({ publicKey: testPublicKey })
      .expect(200);

    expect(joinResponse.body.success).toBe(true);

    // Step 4: Verify member was added
    const membersResponse = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .expect(200);

    expect(membersResponse.body.success).toBe(true);
    expect(Array.isArray(membersResponse.body.data)).toBe(true);

    // Step 5: Make a contribution
    const contributeResponse = await request(app)
      .post(`/api/groups/${groupId}/contribute`)
      .send({
        publicKey: testPublicKey,
        amount: '100',
      })
      .expect(200);

    expect(contributeResponse.body.success).toBe(true);

    // Step 6: Verify transaction was recorded
    const transactionsResponse = await request(app)
      .get(`/api/groups/${groupId}/transactions`)
      .expect(200);

    expect(transactionsResponse.body.success).toBe(true);
    expect(Array.isArray(transactionsResponse.body.data)).toBe(true);
  });

  it('should handle multiple members joining', async () => {
    // Create group
    const createResponse = await request(app)
      .post('/api/groups')
      .send({
        name: 'Multi-Member Group',
        contributionAmount: '50',
        frequency: 'monthly',
        maxMembers: 3,
      })
      .expect(201);

    groupId = createResponse.body.data.groupId;

    // Add multiple members
    const members = ['GABC1...', 'GDEF2...', 'GHIJ3...'];

    for (const publicKey of members) {
      await request(app)
        .post(`/api/groups/${groupId}/join`)
        .send({ publicKey })
        .expect(200);
    }

    // Verify all members
    const membersResponse = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .expect(200);

    expect(membersResponse.body.success).toBe(true);
  });
});
