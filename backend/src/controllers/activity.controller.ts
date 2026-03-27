import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { activityService } from "../services/activity.service";
import { ActivityEventType } from "../types/activity.types";

// ─── Validation ───────────────────────────────────────────────────────────────

const feedQuerySchema = z.object({
  groupId:    z.string().uuid().optional(),
  userId:     z.string().uuid().optional(),
  eventTypes: z.string().optional(), // comma-separated list
  before:     z.string().datetime({ offset: true }).optional(),
  after:      z.string().datetime({ offset: true }).optional(),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  page:       z.coerce.number().int().min(1).default(1),
});

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/activity
 *
 * Global feed — returns recent activity the authenticated user is allowed
 * to see (i.e. groups they belong to). Supports all filter params.
 *
 * Query params:
 *   groupId, userId, eventTypes (CSV), before, after, limit, page
 */
export async function getActivityFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = feedQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { eventTypes: rawTypes, ...rest } = parsed.data;

    const eventTypes = rawTypes
      ? (rawTypes.split(",").map((t) => t.trim()) as ActivityEventType[])
      : undefined;

    const result = await activityService.getFeed({ ...rest, eventTypes });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/groups/:groupId/activity
 *
 * Group-scoped feed — same as above but groupId is taken from the route param.
 * Member-only: the auth middleware (not shown) must confirm group membership.
 */
export async function getGroupActivityFeed(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = feedQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(422).json({ errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { eventTypes: rawTypes, ...rest } = parsed.data;

    const eventTypes = rawTypes
      ? (rawTypes.split(",").map((t) => t.trim()) as ActivityEventType[])
      : undefined;

    const result = await activityService.getFeed({
      ...rest,
      eventTypes,
      groupId: req.params.groupId,  // override any query param
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/activity/:id
 *
 * Fetch a single activity record by ID.
 */
export async function getActivityById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const activity = await activityService.getById(req.params.id);
    if (!activity) {
      res.status(404).json({ message: "Activity record not found" });
      return;
    }
    res.status(200).json(activity);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/groups/:groupId/activity/summary
 *
 * Returns event-type counts for the group over the last 30 days.
 * Used by the group dashboard to render contribution/distribution summaries.
 *
 * Query params:
 *   days (default 30, max 365)
 */
export async function getGroupActivitySummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const days = Math.min(
      Math.max(parseInt(req.query.days as string) || 30, 1),
      365
    );

    const summary = await activityService.getSummary(
      req.params.groupId,
      days
    );

    res.status(200).json({ groupId: req.params.groupId, days, summary });
  } catch (err) {
    next(err);
  }
}