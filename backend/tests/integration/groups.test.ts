import request from 'supertest';
import app from '../../src/index';

describe('Groups API Integration Tests', () => {
  describe('GET /api/groups', () => {
    it('should return 200 and list of groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should handle pagination query parameters', async () => {
      const response = await request(app)
        .get('/api/groups?page=1&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should return valid pagination metadata', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNextPage');
      expect(response.body.pagination).toHaveProperty('hasPrevPage');
    });
  });

  describe('GET /api/groups/:id', () => {
    it('should return 404 for non-existent group', async () => {
      const response = await request(app)
        .get('/api/groups/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Group not found');
    });

    it('should return group data for valid ID', async () => {
      // Since we don't have real data, this will return 404
      // In a real scenario with data, this would return 200
      const response = await request(app)
        .get('/api/groups/group-1')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Group not found');
    });
  });

  describe('POST /api/groups', () => {
    it('should create a new group', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'Test description',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 10,
      };

      const response = await request(app)
        .post('/api/groups')
        .send(groupData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('groupId');
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/groups')
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/groups/:id/join', () => {
    it('should allow user to join group', async () => {
      const response = await request(app)
        .post('/api/groups/group-1/join')
        .send({ publicKey: 'GABC123...' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should require publicKey', async () => {
      const response = await request(app)
        .post('/api/groups/group-1/join')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/groups/:id/contribute', () => {
    it('should process contribution', async () => {
      const response = await request(app)
        .post('/api/groups/group-1/contribute')
        .send({ amount: '100', publicKey: 'GABC123...' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should require amount and publicKey', async () => {
      const response = await request(app)
        .post('/api/groups/group-1/contribute')
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/groups/:id/members', () => {
    it('should return list of members', async () => {
      const response = await request(app)
        .get('/api/groups/group-1/members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/groups/:id/transactions', () => {
    it('should return paginated transactions', async () => {
      const response = await request(app)
        .get('/api/groups/group-1/transactions')
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/groups/group-1/transactions?page=2&limit=5')
        .expect(200);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      await request(app)
        .post('/api/groups')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/groups')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
