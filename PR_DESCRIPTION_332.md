# PR Description: Implement BullMQ Job Queue System

## Summary

This PR implements a robust background job queue system using BullMQ and Redis to handle asynchronous tasks such as email sending, payout processing, blockchain sync, and notifications.

## Changes Made

### New Files

| File | Description |
|------|-------------|
| `backend/src/queues/queueManager.ts` | Centralized queue and worker management with Redis connection, default job options, event listeners, and graceful shutdown |
| `backend/src/queues/emailQueue.ts` | Email job queue with support for priority and delayed jobs |
| `backend/src/queues/payoutQueue.ts` | Payout job queue with batch processing support for blockchain payouts |
| `backend/src/queues/syncQueue.ts` | Blockchain sync job queue for full/incremental synchronization |
| `backend/src/queues/notificationQueue.ts` | Notification queue supporting multiple channels (push, email, sms) |
| `backend/src/queues/index.ts` | Queue module exports and initialization |
| `backend/src/jobs/emailJob.ts` | Email processor with validation, progress tracking, and retry logic |
| `backend/src/jobs/payoutJob.ts` | Payout processor with blockchain transaction simulation |
| `backend/src/jobs/workers.ts` | Worker setup with configurable concurrency limits |
| `backend/src/jobs/index.ts` | Jobs module exports |
| `backend/src/services/jobMonitor.ts` | Service for queue stats, failed job retrieval, job retry/removal, and system health |
| `backend/src/routes/jobs.ts` | REST API routes for job submission and monitoring |

### Modified Files

| File | Changes |
|------|---------|
| `backend/src/index.ts` | Added queue initialization, worker startup, and job routes |
| `backend/package.json` | Added bullmq and ioredis dependencies |

## Features

### Queue System
- **Centralized Management**: Single queue manager handles all queue operations
- **Redis Integration**: Uses ioredis for reliable Redis connection
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Job Cleanup**: Automatic removal of completed/failed jobs after configurable age

### Queues Implemented
1. **Email Queue**: Send transactional emails with templates
2. **Payout Queue**: Process blockchain payouts with 5 retries
3. **Sync Queue**: Blockchain synchronization jobs
4. **Notification Queue**: Multi-channel notifications (push, email, sms)

### Worker Concurrency
- Email: 10 concurrent jobs
- Payout: 5 concurrent jobs
- Sync: 3 concurrent jobs
- Notification: 15 concurrent jobs

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs/health` | System health status |
| GET | `/jobs/stats` | All queue statistics |
| GET | `/jobs/:queue/stats` | Specific queue stats |
| GET | `/jobs/:queue/failed` | Failed jobs list |
| POST | `/jobs/email` | Submit email job |
| POST | `/jobs/payout` | Submit payout job |
| POST | `/jobs/sync` | Submit sync job |
| POST | `/jobs/notification` | Submit notification job |
| POST | `/jobs/:queue/:jobId/retry` | Retry failed job |
| DELETE | `/jobs/:queue/:jobId` | Remove job |
| GET | `/jobs/:queue/:jobId` | Get job details |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | localhost | Redis server host |
| `REDIS_PORT` | 6379 | Redis server port |
| `REDIS_PASSWORD` | - | Redis password (optional) |

## Testing

To test the implementation:

1. Ensure Redis is running
2. Start the server: `npm run dev`
3. Submit a test email job:
```bash
curl -X POST http://localhost:3001/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Hello World"}'
```
4. Check job status: `curl http://localhost:3001/jobs/stats`

## Migration Notes

None required - this is a new feature addition.

## Checklist

- [x] Jobs are added to queues successfully
- [x] Workers process jobs correctly
- [x] Retry logic triggers on failure
- [x] Delayed jobs execute at correct time
- [x] Monitoring endpoints return correct stats
- [x] System handles errors without crashing

## Related Issues

Closes #332
