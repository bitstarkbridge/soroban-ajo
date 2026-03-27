import { createQueue, getQueue } from './queueManager'
import { logger } from '../utils/logger'

// Queue name constant
export const EMAIL_QUEUE_NAME = 'email'

// Email job data types
export interface EmailJobData {
  to: string
  subject: string
  body: string
  template?: string
  attachments?: Array<{
    filename: string
    path: string
  }>
  priority?: number
}

// Additional email options
export interface EmailJobOptions {
  delay?: number // Delay in milliseconds for scheduled emails
  priority?: number // Job priority (higher = more important)
}

/**
 * Get or create the email queue
 */
export function getEmailQueue() {
  return getQueue(EMAIL_QUEUE_NAME) || createQueue(EMAIL_QUEUE_NAME)
}

/**
 * Add an email job to the queue
 */
export async function addEmailJob(
  data: EmailJobData,
  options?: EmailJobOptions
): Promise<string> {
  const queue = getEmailQueue()
  
  const jobId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
  
  const jobOptions: any = {
    jobId,
  }
  
  // Add delay if specified for scheduled emails
  if (options?.delay) {
    jobOptions.delay = options.delay
  }
  
  // Add priority if specified
  if (options?.priority !== undefined) {
    jobOptions.priority = options.priority
  }
  
  await queue.add('send-email', data, jobOptions)
  
  logger.info(`Email job added to queue`, {
    to: data.to,
    subject: data.subject,
    jobId,
    delay: options?.delay || 0,
    priority: options?.priority || 0,
  })
  
  return jobId
}

/**
 * Get email queue statistics
 */
export async function getEmailQueueStats() {
  const queue = getEmailQueue()
  if (!queue) return null
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ])
  
  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  }
}

// ── Typed queueEmail helper (Issue #378) ──────────────────────────────────
// Provides a clean API for controllers to enqueue specific email types
// without importing the full EmailService.

export const queueEmail = {
  async custom(opts: { to: string; subject: string; html: string }): Promise<string> {
    return addEmailJob({ to: opts.to, subject: opts.subject, body: opts.html })
  },

  async welcome(to: string, name: string): Promise<string> {
    return addEmailJob({
      to,
      subject: 'Welcome to Ajo!',
      body: '',
      template: 'welcome',
      // The actual render happens in the job worker via emailService
    }, { priority: 5 })
  },

  async contributionReminder(
    to: string,
    groupName: string,
    amount: string,
    dueDate: string,
    cycleNumber: number,
    groupId: string
  ): Promise<string> {
    return addEmailJob({
      to,
      subject: `Contribution Reminder: ${groupName}`,
      body: JSON.stringify({ groupName, amount, dueDate, cycleNumber, groupId }),
      template: 'contributionReminder',
    })
  },

  async payoutNotification(
    to: string,
    groupName: string,
    amount: string,
    txHash: string,
    cycleNumber: number,
    date: string
  ): Promise<string> {
    return addEmailJob({
      to,
      subject: `Payout Received: ${groupName}`,
      body: JSON.stringify({ groupName, amount, txHash, cycleNumber, date }),
      template: 'payoutNotification',
    }, { priority: 10 })
  },

  async transactionReceipt(
    to: string,
    data: { groupName: string; amount: string; txHash: string; date: string; cycleNumber: number }
  ): Promise<string> {
    return addEmailJob({
      to,
      subject: 'Transaction Receipt',
      body: JSON.stringify(data),
      template: 'transactionReceipt',
    }, { priority: 8 })
  },

  async weeklySummary(to: string, data: object): Promise<string> {
    return addEmailJob({
      to,
      subject: 'Your Weekly Ajo Summary',
      body: JSON.stringify(data),
      template: 'weeklySummary',
    })
  },

  async verification(to: string, token: string): Promise<string> {
    return addEmailJob({
      to,
      subject: 'Verify Your Email',
      body: JSON.stringify({ token }),
      template: 'emailVerification',
    }, { priority: 10 })
  },
}
