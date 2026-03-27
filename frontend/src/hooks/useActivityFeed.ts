import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { ActivityFeedResponse, ActivityEventType } from "@/types/activity.types";

// ─── API client ───────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface FetchFeedParams {
  groupId?: string;
  userId?: string;
  eventTypes?: ActivityEventType[];
  limit?: number;
  page?: number;
  before?: string;
}

async function fetchActivityFeed(
  params: FetchFeedParams,
  token: string
): Promise<ActivityFeedResponse> {
  const url = new URL(
    params.groupId
      ? `${API_URL}/api/v1/groups/${params.groupId}/activity`
      : `${API_URL}/api/v1/activity`
  );

  if (params.userId)      url.searchParams.set("userId",     params.userId);
  if (params.eventTypes)  url.searchParams.set("eventTypes", params.eventTypes.join(","));
  if (params.limit)       url.searchParams.set("limit",      String(params.limit));
  if (params.page)        url.searchParams.set("page",       String(params.page));
  if (params.before)      url.searchParams.set("before",     params.before);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Activity feed request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Paginated hook (page-number style) ──────────────────────────────────────

interface UseActivityFeedParams extends FetchFeedParams {
  token: string;
  enabled?: boolean;
}

export function useActivityFeed({
  token,
  enabled = true,
  ...params
}: UseActivityFeedParams) {
  return useQuery({
    queryKey: ["activityFeed", params],
    queryFn:  () => fetchActivityFeed(params, token),
    enabled:  enabled && !!token,
    staleTime: 30_000,        // 30 s — presence data changes frequently
    refetchInterval: 60_000,  // poll every 60 s for live-ish feed
  });
}

// ─── Infinite scroll hook (cursor-based) ─────────────────────────────────────

export function useInfiniteActivityFeed({
  token,
  enabled = true,
  ...params
}: UseActivityFeedParams) {
  return useInfiniteQuery({
    queryKey: ["activityFeedInfinite", params],
    queryFn: ({ pageParam }) =>
      fetchActivityFeed(
        { ...params, before: pageParam as string | undefined },
        token
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    enabled: enabled && !!token,
    staleTime: 30_000,
  });
}

// ─── Group summary hook ───────────────────────────────────────────────────────

interface ActivitySummary {
  groupId: string;
  days: number;
  summary: Record<string, number>;
}

export function useGroupActivitySummary(
  groupId: string,
  token: string,
  days = 30
) {
  return useQuery<ActivitySummary>({
    queryKey: ["activitySummary", groupId, days],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/api/v1/groups/${groupId}/activity/summary?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Summary request failed: ${res.status}`);
      return res.json();
    },
    enabled: !!groupId && !!token,
    staleTime: 5 * 60_000, // 5 min — summary data changes slowly
  });
}