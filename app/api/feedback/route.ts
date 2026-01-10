import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface FeedbackRequest {
  messageId: string;
  creators: string[];
  rating?: number;
  comment?: string;
  messageContent: string;
  messageType: "chat" | "analysis";
}

// POST: Submit feedback
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.messageId || !body.creators || body.creators.length === 0) {
      return NextResponse.json(
        { error: "messageId and creators are required" },
        { status: 400 },
      );
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: "rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if feedback already exists for this message
    const { data: existing } = await supabase
      .from("feedback")
      .select("id")
      .eq("message_id", body.messageId)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Update existing feedback
      const { data, error } = await supabase
        .from("feedback")
        .update({
          rating: body.rating || null,
          comment: body.comment || null,
          creators: body.creators,
          message_content: body.messageContent,
          message_type: body.messageType,
          synced_at: null, // Reset sync status
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ id: data.id, success: true, updated: true });
    } else {
      // Create new feedback
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          message_id: body.messageId,
          user_id: user.id,
          creators: body.creators,
          rating: body.rating || null,
          comment: body.comment || null,
          message_content: body.messageContent,
          message_type: body.messageType,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ id: data.id, success: true, updated: false });
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

// GET: Get feedback for a message (optional)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      throw error;
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
