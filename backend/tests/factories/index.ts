let idCounter = 1;

export class GroupFactory {
  static create(overrides: any = {}) {
    return {
      id: `group-${idCounter++}`,
      name: `Test Group ${idCounter}`,
      description: 'Test group description',
      contributionAmount: '100',
      frequency: 'weekly',
      maxMembers: 10,
      currentMembers: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createBatch(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

export class MemberFactory {
  static create(overrides: any = {}) {
    return {
      publicKey: `G${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      name: `Test User ${idCounter++}`,
      joinedAt: new Date().toISOString(),
      contributionsMade: 0,
      totalContributed: '0',
      ...overrides,
    };
  }

  static createBatch(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

export class TransactionFactory {
  static create(overrides: any = {}) {
    return {
      id: `tx-${idCounter++}`,
      groupId: 'group-1',
      type: 'contribution',
      from: `G${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      amount: '100',
      timestamp: new Date().toISOString(),
      hash: `hash-${Math.random().toString(36).substring(2, 15)}`,
      ...overrides,
    };
  }

  static createBatch(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

export class WebhookPayloadFactory {
  static create(overrides: any = {}) {
    return {
      id: `webhook-${idCounter++}`,
      event: 'group.created',
      timestamp: new Date().toISOString(),
      data: {},
      metadata: {},
      ...overrides,
    };
  }
}

export function resetFactories() {
  idCounter = 1;
}
