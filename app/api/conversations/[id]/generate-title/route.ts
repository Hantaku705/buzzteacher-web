import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { userMessage, aiResponse } = await request.json();

    if (!userMessage || !aiResponse) {
      return NextResponse.json(
        { error: "userMessage and aiResponse are required" },
        { status: 400 },
      );
    }

    // Generate title using Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `以下の会話内容を簡潔なタイトル（日本語、自然な長さ）にしてください。
URLがある場合は@usernameを含めてください。
タイトルのみを出力してください（説明や引用符は不要）。

ユーザー: ${userMessage.slice(0, 300)}
AI応答の冒頭: ${aiResponse.slice(0, 500)}`;

    const result = await model.generateContent(prompt);
    const title = result.response
      .text()
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .slice(0, 50);

    // Update conversation title
    const { data, error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update title:", error);
      return NextResponse.json(
        { error: "Failed to update title" },
        { status: 500 },
      );
    }

    return NextResponse.json({ title: data.title });
  } catch (error) {
    console.error("Generate title error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
