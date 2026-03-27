import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler'
import { AppError } from '../errors/AppError'
import { UserDataExportService, ExportFormat, ExportDataType } from '../services/userDataExportService'

const prisma = new PrismaClient()
const exportService = new UserDataExportService(prisma)

const createExportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  dataType: z.enum(['user', 'groups', 'transactions', 'all']),
  dateRange: z
    .object({ start: z.coerce.date(), end: z.coerce.date() })
    .optional(),
})

export class DataExportController {
  /**
   * POST /api/exports
   * Create a new export job
   */
  createExport = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.walletAddress
    if (!userId) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

    const parsed = createExportSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Invalid request', 'VALIDATION_ERROR', 400, parsed.error.errors)
    }

    const result = await exportService.createExport(userId, {
      format: parsed.data.format as ExportFormat,
      dataType: parsed.data.dataType as ExportDataType,
      dateRange: parsed.data.dateRange,
    })

    res.status(202).json({ success: true, data: result })
  })

  /**
   * GET /api/exports
   * List all exports for the authenticated user
   */
  listExports = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.walletAddress
    if (!userId) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

    const exports = await exportService.listExports(userId)
    res.json({ success: true, data: exports })
  })

  /**
   * GET /api/exports/:id
   * Get status of a specific export
   */
  getExport = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.walletAddress
    if (!userId) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

    const record = await exportService.getExport(req.params.id, userId)
    if (!record) throw new AppError('Export not found', 'NOT_FOUND', 404)

    res.json({ success: true, data: record })
  })

  /**
   * GET /api/exports/:id/download
   * Download the export file
   */
  downloadExport = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.walletAddress
    if (!userId) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

    const file = await exportService.streamExport(req.params.id, userId)
    if (!file) throw new AppError('Export not ready or not found', 'NOT_FOUND', 404)

    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
    res.sendFile(file.filePath)
  })

  /**
   * DELETE /api/exports/:id
   * Delete an export and its file
   */
  deleteExport = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.walletAddress
    if (!userId) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

    await exportService.deleteExport(req.params.id, userId)
    res.json({ success: true, message: 'Export deleted' })
  })
}
