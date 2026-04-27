import type { ActivityLog } from "@/lib/types";

export async function GET() {
  const activities: ActivityLog[] = [];

  // TODO: Replace this placeholder with a Supabase select from activity logs.
  return Response.json(activities);
}

export async function POST(request: Request) {
  const submittedActivity = (await request.json()) as Partial<ActivityLog>;

  // TODO: Validate the payload and insert the activity log with Supabase.
  return Response.json(submittedActivity, { status: 201 });
}
