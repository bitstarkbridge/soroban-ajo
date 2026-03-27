/**
 * WebSocketService
 *
 * Thin wrapper that initialises the /notifications namespace on an existing
 * Socket.IO server instance (shared with chatService).
 */
import { notificationService } from './notificationService'
import { logger } from '../utils/logger'

class WebSocketService {
  /**
   * Call this after chatService.init() to attach the notification namespace
   * to the same Socket.IO server.
   *
   * @param io - The Socket.IO Server instance returned by chatService.getIO()
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init(io: any) {
    notificationService.init(io)
    logger.info('WebSocketService: notification namespace attached')
  }
}

export const websocketService = new WebSocketService()
