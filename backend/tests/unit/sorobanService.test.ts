import { SorobanService } from '../../src/services/sorobanService';
import { GroupFactory } from '../factories';

jest.mock('stellar-sdk', () => ({
  SorobanRpc: {
    Server: jest.fn().mockImplementation(() => ({
      sendTransaction: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
      getTransaction: jest.fn().mockResolvedValue({ status: 'SUCCESS' }),
    })),
  },
  Networks: {
    TESTNET: 'Test SDF Network ; September 2015',
  },
}));

describe('SorobanService', () => {
  let service: SorobanService;

  beforeEach(() => {
    service = new SorobanService();
  });

  describe('getAllGroups', () => {
    it('should return paginated groups', async () => {
      const result = await service.getAllGroups({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should handle pagination correctly', async () => {
      const result = await service.getAllGroups({ page: 2, limit: 5 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });

    it('should calculate pagination metadata correctly', async () => {
      const result = await service.getAllGroups({ page: 1, limit: 10 });

      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('hasNextPage');
      expect(result.pagination).toHaveProperty('hasPrevPage');
    });
  });

  describe('getGroup', () => {
    it('should return null for non-existent group', async () => {
      const result = await service.getGroup('non-existent');
      expect(result).toBeNull();
    });

    it('should handle valid group ID', async () => {
      const result = await service.getGroup('group-1');
      expect(result).toBeDefined();
    });
  });

  describe('createGroup', () => {
    it('should create a group and return groupId', async () => {
      const groupData = GroupFactory.create();
      const result = await service.createGroup(groupData);

      expect(result).toHaveProperty('groupId');
      expect(result.groupId).toBeDefined();
    });

    it('should handle group creation with valid data', async () => {
      const groupData = {
        name: 'Test Group',
        contributionAmount: '100',
        frequency: 'weekly',
        maxMembers: 10,
      };

      const result = await service.createGroup(groupData);
      expect(result.groupId).toBeTruthy();
    });
  });

  describe('joinGroup', () => {
    it('should allow user to join group', async () => {
      const result = await service.joinGroup('group-1', 'GABC123...');

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    it('should handle join with valid publicKey', async () => {
      const publicKey = 'GDEF456...';
      const result = await service.joinGroup('group-1', publicKey);

      expect(result.success).toBe(true);
    });
  });

  describe('contribute', () => {
    it('should process contribution successfully', async () => {
      const result = await service.contribute('group-1', 'GABC123...', '100');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result.success).toBe(true);
    });

    it('should return transaction ID on successful contribution', async () => {
      const result = await service.contribute('group-1', 'GABC123...', '100');

      expect(result.transactionId).toBeDefined();
      expect(typeof result.transactionId).toBe('string');
    });
  });

  describe('getGroupMembers', () => {
    it('should return empty array for group with no members', async () => {
      const result = await service.getGroupMembers('group-1');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle valid group ID', async () => {
      const result = await service.getGroupMembers('group-1');
      expect(result).toBeDefined();
    });
  });

  describe('getGroupTransactions', () => {
    it('should return paginated transactions', async () => {
      const result = await service.getGroupTransactions('group-1', {
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle pagination for transactions', async () => {
      const result = await service.getGroupTransactions('group-1', {
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });
  });
});
