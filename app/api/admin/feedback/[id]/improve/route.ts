import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/constants/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCreatorById } from "@/lib/knowledge/loader";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// クリエイターの現在のナレッジサマリーを取得
function getCreatorSummary(creatorId: string): string {
  const creator = getCreatorById(creatorId);
  if (!creator) {
    return `クリエイター「${creatorId}」のナレッジが見つかりません。`;
  }

  return `
## ${creator.name}

### 基本情報
- ID: ${creator.id}
- 説明: ${creator.description}
- フォロワー: ${creator.followers || "不明"}

### 実績
${creator.achievements?.map((a) => `- ${a}`).join("\n") || "- なし"}

### 代表作
${creator.works?.map((w) => `- ${w}`).join("\n") || "- なし"}

### 経歴
${creator.career?.map((c) => `- ${c}`).join("\n") || "- なし"}
  `.trim();
}

// POST: Generate AI improvement suggestion
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get feedback details
    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    const creatorId = feedback.creators?.[0] || "doshirouto";
    const currentKnowledge = getCreatorSummary(creatorId);

    // Generate improvement suggestion using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
あなたはバズ動画コンサルタントのナレッジベースを管理する専門家です。
以下のユーザーフィードバックに基づいて、ナレッジの改善提案を作成してください。

## 現在のナレッジ
${currentKnowledge}

## ユーザーフィードバック
- 評価: ${feedback.rating ? `${feedback.rating}/5` : "未評価"}
- コメント: ${feedback.comment || "なし"}
- 対象の回答タイプ: ${feedback.message_type === "analysis" ? "アカウント分析" : "チャット"}

## 対象の回答内容（抜粋）
${feedback.message_content?.slice(0, 1000) || "なし"}

## 指示
1. フィードバックの問題点を分析
2. ナレッジの具体的な改善案を提案
3. 改善案はMarkdown形式で出力
4. 変更が必要な箇所は「【改善】」マークをつける

改善提案を以下の形式で出力してください：

### 問題の分析
[フィードバックから読み取れる問題点]

### 改善提案
[具体的な改善内容]

### 改善後のナレッジ（該当箇所のみ）
[変更後の内容]
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const improved = result.response.text();

    return NextResponse.json({
      feedbackId: id,
      creatorId,
      original: currentKnowledge,
      improved,
      feedback: {
        rating: feedback.rating,
        comment: feedback.comment,
        message_type: feedback.message_type,
      },
    });
  } catch (error) {
    console.error("Error generating improvement:", error);
    return NextResponse.json(
      { error: "Failed to generate improvement" },
      { status: 500 },
    );
  }
}
