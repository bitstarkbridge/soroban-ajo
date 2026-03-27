export const mockGroups = [
  {
    id: 'group-1',
    name: 'Test Savings Group 1',
    description: 'A test savings group',
    contributionAmount: '100',
    frequency: 'weekly',
    maxMembers: 10,
    currentMembers: 5,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'group-2',
    name: 'Test Savings Group 2',
    description: 'Another test group',
    contributionAmount: '200',
    frequency: 'monthly',
    maxMembers: 20,
    currentMembers: 10,
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z',
  },
];

export const mockMembers = [
  {
    publicKey: 'GABC123...',
    name: 'Test User 1',
    joinedAt: '2024-01-01T00:00:00Z',
    contributionsMade: 5,
    totalContributed: '500',
  },
  {
    publicKey: 'GDEF456...',
    name: 'Test User 2',
    joinedAt: '2024-01-02T00:00:00Z',
    contributionsMade: 3,
    totalContributed: '300',
  },
];

export const mockTransactions = [
  {
    id: 'tx-1',
    groupId: 'group-1',
    type: 'contribution',
    from: 'GABC123...',
    amount: '100',
    timestamp: '2024-01-01T00:00:00Z',
    hash: 'hash123',
  },
  {
    id: 'tx-2',
    groupId: 'group-1',
    type: 'payout',
    to: 'GDEF456...',
    amount: '500',
    timestamp: '2024-01-02T00:00:00Z',
    hash: 'hash456',
  },
];

export const mockWebhookPayload = {
  id: 'webhook-1',
  event: 'group.created',
  timestamp: '2024-01-01T00:00:00Z',
  data: {
    groupId: 'group-1',
    name: 'Test Group',
  },
  metadata: {
    groupId: 'group-1',
    network: 'testnet',
  },
};

import { WebhookEventType } from '../../src/services/webhookService';

export const mockWebhookEndpoint = {
  url: 'https://example.com/webhook',
  secret: 'test-secret-key',
  events: [WebhookEventType.GROUP_CREATED, WebhookEventType.MEMBER_JOINED],
  enabled: true,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};
