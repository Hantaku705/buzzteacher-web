import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/constants/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get feedback detail
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

// PATCH: Update feedback status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, improvement_note } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .update({
        status,
        improvement_note: improvement_note || null,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 },
    );
  }
}
