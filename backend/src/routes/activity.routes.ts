import { Router } from "express";
import {
  getActivityFeed,
  getActivityById,
  getGroupActivityFeed,
  getGroupActivitySummary,
} from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";        // existing middleware
import { requireGroupMember } from "../middleware/groups"; // existing middleware

const router = Router();

// ── Global feed (all groups the user belongs to) ──────────────────────────────
// GET /api/v1/activity
router.get("/", authenticate, getActivityFeed);

// ── Single record ─────────────────────────────────────────────────────────────
// GET /api/v1/activity/:id
router.get("/:id", authenticate, getActivityById);

// ── Group-scoped feed ─────────────────────────────────────────────────────────
// GET /api/v1/groups/:groupId/activity
router.get(
  "/groups/:groupId/activity",
  authenticate,
  requireGroupMember,
  getGroupActivityFeed
);

// ── Group activity summary (dashboard widget) ─────────────────────────────────
// GET /api/v1/groups/:groupId/activity/summary
router.get(
  "/groups/:groupId/activity/summary",
  authenticate,
  requireGroupMember,
  getGroupActivitySummary
);

export default router;