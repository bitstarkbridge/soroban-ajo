import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { DataExportController } from '../controllers/dataExportController'

const router = Router()
const controller = new DataExportController()

/**
 * @swagger
 * tags:
 *   name: Exports
 *   description: User data export endpoints
 */

/**
 * @swagger
 * /api/exports:
 *   post:
 *     summary: Create a data export job
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [format, dataType]
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [csv, json, pdf]
 *               dataType:
 *                 type: string
 *                 enum: [user, groups, transactions, all]
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       202:
 *         description: Export job created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, controller.createExport)

/**
 * @swagger
 * /api/exports:
 *   get:
 *     summary: List all exports for the authenticated user
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exports
 */
router.get('/', authMiddleware, controller.listExports)

/**
 * @swagger
 * /api/exports/{id}:
 *   get:
 *     summary: Get export status
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Export record
 *       404:
 *         description: Not found
 */
router.get('/:id', authMiddleware, controller.getExport)

/**
 * @swagger
 * /api/exports/{id}/download:
 *   get:
 *     summary: Download the export file
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File download
 *       404:
 *         description: Export not ready or not found
 */
router.get('/:id/download', authMiddleware, controller.downloadExport)

/**
 * @swagger
 * /api/exports/{id}:
 *   delete:
 *     summary: Delete an export
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', authMiddleware, controller.deleteExport)

export const exportsRouter = router
