import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/constants/admin";

// GET: List all feedback (admin only)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("feedback")
      .select("*", { count: "exact" })
      .order("rating", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: feedbacks, error, count } = await query;

    if (error) throw error;

    // Calculate stats
    const { data: allFeedbacks } = await supabase
      .from("feedback")
      .select("status, rating");

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      avgRating: 0,
      total: 0,
    };

    if (allFeedbacks) {
      let ratingSum = 0;
      let ratingCount = 0;

      for (const fb of allFeedbacks) {
        stats.total++;
        if (fb.status === "pending") stats.pending++;
        else if (fb.status === "approved") stats.approved++;
        else if (fb.status === "rejected") stats.rejected++;

        if (fb.rating) {
          ratingSum += fb.rating;
          ratingCount++;
        }
      }

      stats.avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
    }

    return NextResponse.json({
      feedbacks: feedbacks || [],
      total: count || 0,
      stats,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
