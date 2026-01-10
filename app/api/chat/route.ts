import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel function timeout (Pro plan: max 300 seconds)
export const maxDuration = 300;
import {
  detectPlatform,
  extractVideoUrl,
  isTikTokProfileUrl,
} from "@/lib/utils/platform";
import {
  getTikTokInsight,
  downloadTikTokVideo,
  getTikTokUserVideos,
  TikTokVideo,
} from "@/lib/api/tiktok";
import {
  getInstagramInsight,
  downloadInstagramVideo,
} from "@/lib/api/instagram";
import {
  analyzeVideoWithGemini,
  analyzeYouTubeWithGemini,
} from "@/lib/api/gemini";
import {
  getKnowledgeSummary,
  getCreatorSummary,
  AVAILABLE_CREATORS,
  CreatorInfo,
} from "@/lib/knowledge/loader";
import { VideoAnalysisResult, VideoItem } from "@/lib/types";

// アカウント統計のインターフェース
interface AccountStats {
  // 基本指標
  videoCount: number;
  totalViews: number;
  avgViews: number;
  totalLikes: number;
  avgLikes: number;

  // エンゲージメント詳細
  lvr: number; // Like-to-View Ratio (%)
  cvr: number; // Comment-to-View Ratio (%)
  svr: number; // Share-to-View Ratio (%)
  saveRate: number; // Save Rate (%)
  totalEngagementRate: number; // 総合エンゲージメント率

  // パフォーマンス分布
  maxViews: number;
  minViews: number;
  medianViews: number;
  stdDevViews: number;
  buzzVideoRate: number; // 平均の2倍超の割合(%)

  // 時系列
  postingFrequency: string;
  avgDaysBetweenPosts: number;
}

// TikTok業界平均値（参考値）
const INDUSTRY_BENCHMARKS = {
  lvr: 4.5, // いいね率 4.5%
  cvr: 0.2, // コメント率 0.2%
  svr: 0.15, // シェア率 0.15%
  saveRate: 0.5, // 保存率 0.5%
};

// 統計計算関数
function calculateAccountStats(videos: TikTokVideo[]): AccountStats {
  if (videos.length === 0) {
    return {
      videoCount: 0,
      totalViews: 0,
      avgViews: 0,
      totalLikes: 0,
      avgLikes: 0,
      lvr: 0,
      cvr: 0,
      svr: 0,
      saveRate: 0,
      totalEngagementRate: 0,
      maxViews: 0,
      minViews: 0,
      medianViews: 0,
      stdDevViews: 0,
      buzzVideoRate: 0,
      postingFrequency: "不明",
      avgDaysBetweenPosts: 0,
    };
  }

  // 基本集計
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalSaves = 0;
  const viewsList: number[] = [];

  videos.forEach((video) => {
    totalViews += video.stats.playCount;
    totalLikes += video.stats.likeCount;
    totalComments += video.stats.commentCount;
    totalShares += video.stats.shareCount;
    totalSaves += video.stats.collectCount || 0;
    viewsList.push(video.stats.playCount);
  });

  const avgViews = Math.round(totalViews / videos.length);
  const avgLikes = Math.round(totalLikes / videos.length);

  // エンゲージメント率計算
  const lvr = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;
  const cvr = totalViews > 0 ? (totalComments / totalViews) * 100 : 0;
  const svr = totalViews > 0 ? (totalShares / totalViews) * 100 : 0;
  const saveRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0;
  const totalEngagementRate =
    totalViews > 0
      ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews) *
        100
      : 0;

  // パフォーマンス分布
  const sortedViews = [...viewsList].sort((a, b) => a - b);
  const maxViews = sortedViews[sortedViews.length - 1];
  const minViews = sortedViews[0];
  const medianViews =
    sortedViews.length % 2 === 0
      ? Math.round(
          (sortedViews[sortedViews.length / 2 - 1] +
            sortedViews[sortedViews.length / 2]) /
            2,
        )
      : sortedViews[Math.floor(sortedViews.length / 2)];

  // 標準偏差
  const variance =
    viewsList.reduce((sum, v) => sum + Math.pow(v - avgViews, 2), 0) /
    viewsList.length;
  const stdDevViews = Math.round(Math.sqrt(variance));

  // バズ動画率（平均の2倍超）
  const buzzThreshold = avgViews * 2;
  const buzzVideoCount = viewsList.filter((v) => v > buzzThreshold).length;
  const buzzVideoRate = (buzzVideoCount / videos.length) * 100;

  // 投稿頻度計算
  let postingFrequency = "不明";
  let avgDaysBetweenPosts = 0;
  if (videos.length >= 2) {
    const timestamps = videos.map((v) => v.createTime).sort((a, b) => b - a);
    const daysDiff =
      (timestamps[0] - timestamps[timestamps.length - 1]) / (60 * 60 * 24);
    avgDaysBetweenPosts = daysDiff / (videos.length - 1);

    if (avgDaysBetweenPosts <= 1) {
      postingFrequency = "毎日";
    } else if (avgDaysBetweenPosts <= 2) {
      postingFrequency = "2日に1回";
    } else if (avgDaysBetweenPosts <= 3.5) {
      postingFrequency = "週2-3回";
    } else if (avgDaysBetweenPosts <= 7) {
      postingFrequency = "週1回";
    } else if (avgDaysBetweenPosts <= 14) {
      postingFrequency = "2週に1回";
    } else {
      postingFrequency = "月1-2回";
    }
  }

  return {
    videoCount: videos.length,
    totalViews,
    avgViews,
    totalLikes,
    avgLikes,
    lvr,
    cvr,
    svr,
    saveRate,
    totalEngagementRate,
    maxViews,
    minViews,
    medianViews,
    stdDevViews,
    buzzVideoRate,
    postingFrequency,
    avgDaysBetweenPosts,
  };
}

// 業界平均との比較評価
function getComparisonLabel(value: number, benchmark: number): string {
  const ratio = value / benchmark;
  if (ratio >= 1.5) return "🔥 優秀";
  if (ratio >= 1.0) return "✅ 平均以上";
  if (ratio >= 0.7) return "➖ 平均";
  return "⚠️ 要改善";
}

// 定量分析レポート生成
function generateQuantitativeReport(
  stats: AccountStats,
  username: string,
): string {
  const today = new Date().toISOString().split("T")[0];

  let report = `# 📊 アカウント分析レポート
**対象**: @${username} | **プラットフォーム**: TikTok | **分析日**: ${today}

---

## 1. エグゼクティブサマリー
*（AIが動画分析結果を踏まえて生成）*

---

## 2. 定量分析

### 2.1 基本指標
| 指標 | 値 |
|------|-----|
| 分析動画数 | ${stats.videoCount}件 |
| 総再生数 | ${stats.totalViews.toLocaleString()} |
| 平均再生数 | ${stats.avgViews.toLocaleString()} |
| 総いいね数 | ${stats.totalLikes.toLocaleString()} |
| 平均いいね数 | ${stats.avgLikes.toLocaleString()} |

### 2.2 エンゲージメント詳細
| 指標 | 値 | 業界平均比較 |
|------|-----|-------------|
| LVR（いいね率） | ${stats.lvr.toFixed(2)}% | ${getComparisonLabel(stats.lvr, INDUSTRY_BENCHMARKS.lvr)} |
| CVR（コメント率） | ${stats.cvr.toFixed(3)}% | ${getComparisonLabel(stats.cvr, INDUSTRY_BENCHMARKS.cvr)} |
| SVR（シェア率） | ${stats.svr.toFixed(3)}% | ${getComparisonLabel(stats.svr, INDUSTRY_BENCHMARKS.svr)} |
| 保存率 | ${stats.saveRate.toFixed(3)}% | ${getComparisonLabel(stats.saveRate, INDUSTRY_BENCHMARKS.saveRate)} |
| **総合ER** | **${stats.totalEngagementRate.toFixed(2)}%** | - |

### 2.3 パフォーマンス分布
| 指標 | 値 |
|------|-----|
| 最大再生数 | ${stats.maxViews.toLocaleString()} |
| 最小再生数 | ${stats.minViews.toLocaleString()} |
| 中央値 | ${stats.medianViews.toLocaleString()} |
| 標準偏差 | ${stats.stdDevViews.toLocaleString()} |
| バズ動画率（平均2倍超） | ${stats.buzzVideoRate.toFixed(0)}% |

### 2.4 投稿頻度
- 投稿ペース: **${stats.postingFrequency}**
- 平均投稿間隔: ${stats.avgDaysBetweenPosts.toFixed(1)}日

---

`;
  return report;
}

// 動画ランキング生成
interface VideoRankingResult {
  ranking: string; // Top3 + Worst1（Geminiコンテキスト用）
  videoListJson: VideoItem[]; // 全動画詳細（JSON配列、UI用）
}

function generateVideoRanking(
  videos: TikTokVideo[],
  analysisResults: VideoAnalysisResult[],
): VideoRankingResult {
  // 再生数でソート
  const sortedVideos = [...videos].sort(
    (a, b) => b.stats.playCount - a.stats.playCount,
  );
  const top3 = sortedVideos.slice(0, 3);
  const worst = sortedVideos[sortedVideos.length - 1];

  // 分析結果をマップ化
  const analysisMap = new Map<string, VideoAnalysisResult>();
  analysisResults.forEach((r) => analysisMap.set(r.videoId, r));

  // === ランキング部分（Geminiコンテキスト用） ===
  let ranking = `## 4. 動画別分析（Top 3 + 要改善 1）

`;

  // Top 3
  const medals = ["🏆", "🥈", "🥉"];
  top3.forEach((video, index) => {
    const er =
      video.stats.playCount > 0
        ? (
            ((video.stats.likeCount +
              video.stats.commentCount +
              video.stats.shareCount) /
              video.stats.playCount) *
            100
          ).toFixed(2)
        : "0";
    const analysis = analysisMap.get(video.id);

    ranking += `### ${medals[index]} ${index + 1}位: ${video.desc.slice(0, 40) || "(説明なし)"}${video.desc.length > 40 ? "..." : ""}
- **再生**: ${video.stats.playCount.toLocaleString()} / **いいね**: ${video.stats.likeCount.toLocaleString()} / **ER**: ${er}%
- URL: ${video.url}
${analysis?.analysis ? `- **AI分析**: ${analysis.analysis.slice(0, 200)}...` : ""}

`;
  });

  // Worst
  if (worst && worst.id !== top3[top3.length - 1]?.id) {
    const worstEr =
      worst.stats.playCount > 0
        ? (
            ((worst.stats.likeCount +
              worst.stats.commentCount +
              worst.stats.shareCount) /
              worst.stats.playCount) *
            100
          ).toFixed(2)
        : "0";
    const worstAnalysis = analysisMap.get(worst.id);

    ranking += `### ⚠️ 要改善: ${worst.desc.slice(0, 40) || "(説明なし)"}${worst.desc.length > 40 ? "..." : ""}
- **再生**: ${worst.stats.playCount.toLocaleString()} / **いいね**: ${worst.stats.likeCount.toLocaleString()} / **ER**: ${worstEr}%
- URL: ${worst.url}
${worstAnalysis?.analysis ? `- **AI分析**: ${worstAnalysis.analysis.slice(0, 200)}...` : ""}

`;
  }

  ranking += `---

`;

  // === 全動画詳細（JSON配列、UI用） ===
  const videoListJson: VideoItem[] = videos.map((video) => {
    const analysis = analysisMap.get(video.id);
    const playCount = video.stats.playCount || 1;
    const collectCount = video.stats.collectCount || 0;

    return {
      id: video.id,
      url: video.url,
      desc: video.desc.slice(0, 100),
      thumbnail: video.thumbnail || null,
      createdAt: video.createTime || 0,
      stats: {
        playCount: video.stats.playCount,
        likeCount: video.stats.likeCount,
        commentCount: video.stats.commentCount,
        shareCount: video.stats.shareCount,
        collectCount: collectCount,
      },
      metrics: {
        lvr: (video.stats.likeCount / playCount) * 100,
        cvr: (video.stats.commentCount / playCount) * 100,
        svr: (video.stats.shareCount / playCount) * 100,
        saveRate: (collectCount / playCount) * 100,
        er:
          ((video.stats.likeCount +
            video.stats.commentCount +
            video.stats.shareCount +
            collectCount) /
            playCount) *
          100,
      },
      analysis: analysis?.analysis || null,
      error: analysis?.error,
    };
  });

  return { ranking, videoListJson };
}

// 定性分析プロンプト生成
function generateQualitativePrompt(
  analysisResults: VideoAnalysisResult[],
): string {
  const successfulAnalyses = analysisResults.filter((r) => r.analysis).length;

  let report = `## 3. 定性分析

*以下の観点でAIが分析結果を生成します（${successfulAnalyses}件の動画分析に基づく）*

### 3.1 コンテンツ構成分析
| 要素 | 現状 | 評価 |
|------|------|------|
| フック（冒頭2秒） | *AI分析* | *AI評価* |
| 構成パターン | *AI分析* | *AI評価* |
| CTA | *AI分析* | *AI評価* |
| テロップ使用 | *AI分析* | *AI評価* |

### 3.2 ブランディング分析
- **世界観の一貫性**: *AI分析*
- **差別化ポイント**: *AI分析*
- **ターゲット層**: *AI分析*
- **トーン&マナー**: *AI分析*

### 3.3 競合比較観点
- **ジャンル内ポジション**: *AI分析*
- **競合との差別化**: *AI分析*
- **未開拓の機会**: *AI分析*

---

## 5. 改善提案（優先度順）

### 🔴 最優先（すぐ実施）
*AIが具体的なアクションを提案*

### 🟡 中期（1ヶ月以内）
*AIが具体的なアクションを提案*

### 🟢 長期（3ヶ月以内）
*AIが具体的なアクションを提案*

---

## 6. 次のアクション
*AIがチェックリスト形式で提案*

---

## 動画分析詳細データ

`;

  // 各動画の分析詳細を追加
  analysisResults.forEach((result, index) => {
    report += `### 動画${index + 1}: ${result.desc.slice(0, 50) || "(説明なし)"}
- URL: ${result.videoUrl}
- 再生: ${result.stats.playCount.toLocaleString()} / いいね: ${result.stats.likeCount.toLocaleString()}

${result.analysis ? `**Gemini分析:**\n${result.analysis}\n` : `**分析エラー:** ${result.error || "不明"}\n`}
`;
  });

  return report;
}

// 議論生成用の型
interface CreatorAnalysis {
  creatorId: string;
  creatorName: string;
  content: string;
}

interface DiscussionTurn {
  creatorId?: string;
  creatorName?: string;
  content: string;
  replyTo?: string | null;
  type?: "final";
}

// 議論モードのハンドラー
async function handleDiscussionMode(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  previousAnalyses: CreatorAnalysis[],
  encoder: TextEncoder,
): Promise<Response> {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 議論開始マーカーを送信
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "discussion_start",
            })}\n\n`,
          ),
        );

        // 議論プロンプトを構築
        const analysesText = previousAnalyses
          .map((a) => `### ${a.creatorName}の見解\n${a.content}`)
          .join("\n\n");

        const discussionPrompt = `あなたはBuzzTeacherの議論コーディネーターです。
以下の審査員たちの見解を踏まえて、彼らが実際に会話しているようにディスカッションをシミュレートしてください。

## 各審査員の分析結果
${analysesText}

## 議論ルール
1. 各審査員の特徴的な視点を維持する（それぞれのメソッド・理論に基づく）
2. **クリティカルシンキングで評価する**
   - 良い点：具体的に何が良いか、なぜ効果的か
   - 問題点：何が足りないか、なぜ改善が必要か
   - 代替案：自分のメソッドではどうするか
3. **辛口だが建設的な議論にする**
   - 単なる同意は避け、必ず異なる視点や改善点を提示
   - 「〇〇は良いが、△△が弱い」「〇〇には異議がある」
   - 否定だけでなく、具体的な改善案を示す
4. 実践的な結論に導く
5. 各発言は100-200文字程度で簡潔に
6. **構成案とナレーション案についても批判的に議論する**
   （「〇〇さんのフック案は△△の点で効果的だが、□□が弱い。私なら...」など）
7. **最後に議論を踏まえた「最終統合案」を提示**
   - 各審査員の良い指摘を採用
   - 批判された点は改善した形で統合

## 禁止事項
- 「いいですね」「素晴らしい」「同感です」で終わる発言
- 批判なしの全面同意
- 具体的な理由のない評価

## 出力フォーマット
以下のJSON配列形式で出力してください。各オブジェクトは1人の発言です。
replyToは返信先のcreatorId（最初の発言者はnull）。
5-8ターン（各人が最低2回は発言する往復議論）を生成し、最後に最終統合案を追加してください。

\`\`\`json
[
  {"creatorId": "${previousAnalyses[0]?.creatorId || "creator1"}", "creatorName": "${previousAnalyses[0]?.creatorName || "Creator1"}", "content": "〇〇さんのフック案は△△の点で効果的だが、□□が弱い。私なら...", "replyTo": null},
  {"creatorId": "${previousAnalyses[1]?.creatorId || "creator2"}", "creatorName": "${previousAnalyses[1]?.creatorName || "Creator2"}", "content": "〇〇さんの指摘には異議がある。理由は...。代わりに...", "replyTo": "${previousAnalyses[0]?.creatorId || "creator1"}"},
  ...（批判的な往復議論を5-8ターン）...,
  {"type": "final", "content": "## 🏆 最終統合案\\n\\n### 📝 構成（タイムライン）\\n| 時間 | 内容 | ポイント |\\n|------|------|----------|\\n| 0:00-0:02 | **フック** | [全員の意見を統合したフック] |\\n| 0:02-0:07 | **興味付け** | [統合した興味付け] |\\n| 0:07-0:XX | **本編** | [統合した本編構成] |\\n| ラスト | **コメント誘導** | [統合した誘導] |\\n\\n### 🎤 ナレーション案\\n**[0:00-0:02] フック**\\n「[統合したセリフ]」\\n→ テロップ: [統合したテロップ]\\n\\n**[0:02-0:07] 興味付け**\\n「[統合したセリフ]」\\n\\n**[0:07-] 本編**\\n[統合した展開]\\n\\n**[ラスト] コメント誘導**\\n「[統合した問いかけ]」"}
]
\`\`\`

**重要**: 最後のオブジェクトは必ず \`"type": "final"\` として、全員の議論を踏まえた最終統合案を出力してください。
JSONのみを出力してください。説明は不要です。`;

        // Geminiに議論を生成させる
        const result = await model.generateContent(discussionPrompt);
        const responseText = result.response.text();

        // JSONをパース
        let discussionTurns: DiscussionTurn[] = [];
        try {
          // コードブロックを除去
          let jsonText = responseText
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();

          // JSON配列を抽出（最初の [ から最後の ] まで）
          const startIdx = jsonText.indexOf("[");
          const endIdx = jsonText.lastIndexOf("]");

          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonArray = jsonText.slice(startIdx, endIdx + 1);
            discussionTurns = JSON.parse(jsonArray);
          } else {
            throw new Error("JSON array not found in response");
          }
        } catch (parseError) {
          console.error("Discussion JSON parse error:", parseError);
          console.error(
            "Raw response (first 1000 chars):",
            responseText.substring(0, 1000),
          );

          // フォールバック: Geminiに再度シンプルな形式で生成させる
          // ここではエラーメッセージを表示
          discussionTurns = [
            {
              creatorId: previousAnalyses[0]?.creatorId || "unknown",
              creatorName: previousAnalyses[0]?.creatorName || "システム",
              content:
                "議論の生成中にエラーが発生しました。「再生成」ボタンで再試行してください。",
              replyTo: null,
            },
          ];
        }

        // 最終統合案を分離
        const finalEntry = discussionTurns.find((t) => t.type === "final");
        const regularTurns = discussionTurns.filter((t) => t.type !== "final");

        // 各発言をストリーミング
        for (const turn of regularTurns) {
          // 発言開始マーカー
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "discussion_turn",
                creatorId: turn.creatorId,
                creatorName: turn.creatorName,
                replyTo: turn.replyTo,
              })}\n\n`,
            ),
          );

          // 発言内容を文字ごとにストリーミング（自然な表示のため）
          const content = turn.content;
          const chunkSize = 10; // 10文字ずつ送信
          for (let i = 0; i < content.length; i += chunkSize) {
            const chunk = content.slice(i, i + chunkSize);
            const data = JSON.stringify({
              choices: [{ delta: { content: chunk } }],
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            // 少し遅延を入れて自然に見せる
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          // 発言終了マーカー
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "discussion_turn_end",
                creatorId: turn.creatorId,
              })}\n\n`,
            ),
          );

          // 発言間の間隔
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // 最終統合案をストリーミング
        if (finalEntry) {
          // 最終統合案開始マーカー
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "discussion_final",
              })}\n\n`,
            ),
          );

          // 最終統合案の内容をストリーミング
          const content = finalEntry.content;
          const chunkSize = 10;
          for (let i = 0; i < content.length; i += chunkSize) {
            const chunk = content.slice(i, i + chunkSize);
            const data = JSON.stringify({
              choices: [{ delta: { content: chunk } }],
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          // 最終統合案終了マーカー
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "discussion_final_end",
              })}\n\n`,
            ),
          );
        }

        // 議論終了マーカー
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "discussion_end",
            })}\n\n`,
          ),
        );

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Discussion stream error:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages, creators, discussionMode, previousAnalyses } =
      await req.json();
    const lastMessage = messages[messages.length - 1];
    const userInput = lastMessage.content;

    // Check if user sent a video URL
    const videoUrl = extractVideoUrl(userInput);
    const platform = videoUrl ? detectPlatform(videoUrl) : null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY が設定されていません" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert messages to Gemini format (excluding the last message)
    const history = messages
      .slice(0, -1)
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const encoder = new TextEncoder();

    // Discussion mode: generate discussion between creators
    if (discussionMode && previousAnalyses && previousAnalyses.length > 1) {
      return handleDiscussionMode(model, previousAnalyses, encoder);
    }

    // Determine creators to analyze
    const creatorsToAnalyze: string[] =
      creators && creators.length > 0 ? creators : ["doshirouto"];

    // Progress step type
    interface ProgressStep {
      id: string;
      label: string;
      status: "pending" | "in_progress" | "completed" | "error";
      detail?: string;
    }

    // Helper to send progress events (with optional percent, current, total, steps)
    const sendProgress = (
      controller: ReadableStreamDefaultController,
      stage: string,
      percent?: number,
      current?: number,
      total?: number,
      steps?: ProgressStep[],
    ) => {
      const event: {
        type: string;
        stage: string;
        percent?: number;
        current?: number;
        total?: number;
        steps?: ProgressStep[];
      } = {
        type: "progress",
        stage,
      };
      if (percent !== undefined) event.percent = percent;
      if (current !== undefined) event.current = current;
      if (total !== undefined) event.total = total;
      if (steps) event.steps = steps;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    };

    // Single creator: use simple streaming (backward compatible)
    if (creatorsToAnalyze.length === 1) {
      const creatorId = creatorsToAnalyze[0];
      const knowledgeSummary = getCreatorSummary(creatorId);
      const creatorInfo =
        AVAILABLE_CREATORS.find((c) => c.id === creatorId) || null;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // 即座に初期イベントを送信（ストリームが機能していることを確認）
            sendProgress(controller, "分析を開始しています...", 0);

            // Analyze video with progress updates
            let analysisContext = "";
            let videoListJson: VideoItem[] | undefined; // プロフィール分析時の動画一覧
            if (videoUrl && platform) {
              const analysisResult = await analyzeVideoWithProgress(
                videoUrl,
                platform,
                (stage, percent, current, total, steps) =>
                  sendProgress(
                    controller,
                    stage,
                    percent,
                    current,
                    total,
                    steps,
                  ),
              );
              analysisContext = analysisResult.context;
              videoListJson = analysisResult.videoListJson;
            }

            sendProgress(controller, "アドバイスを生成中...");

            const systemPrompt = buildSystemPrompt(
              knowledgeSummary,
              analysisContext,
              creatorInfo,
            );
            const chat = model.startChat({
              history,
              systemInstruction: {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
            });

            const result = await chat.sendMessageStream(userInput);

            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                const data = JSON.stringify({
                  choices: [{ delta: { content: text } }],
                });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }

            // プロフィール分析時：動画一覧をJSON形式で送信（カスタムUIで表示）
            if (videoListJson && videoListJson.length > 0) {
              const videoListData = JSON.stringify({
                type: "video_list",
                videos: videoListJson,
              });
              controller.enqueue(encoder.encode(`data: ${videoListData}\n\n`));
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Multiple creators: sequential streaming with markers
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 即座に初期イベントを送信（ストリームが機能していることを確認）
          sendProgress(controller, "分析を開始しています...", 0);

          // Analyze video with progress updates (only once for all creators)
          let analysisContext = "";
          let videoListJson: VideoItem[] | undefined; // プロフィール分析時の動画一覧
          if (videoUrl && platform) {
            const analysisResult = await analyzeVideoWithProgress(
              videoUrl,
              platform,
              (stage, percent, current, total, steps) =>
                sendProgress(controller, stage, percent, current, total, steps),
            );
            analysisContext = analysisResult.context;
            videoListJson = analysisResult.videoListJson;
          }

          for (const creatorId of creatorsToAnalyze) {
            const creatorInfo = AVAILABLE_CREATORS.find(
              (c) => c.id === creatorId,
            );
            if (!creatorInfo) continue;

            // Send creator start marker
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "creator_start",
                  creatorId: creatorId,
                  name: creatorInfo.name,
                })}\n\n`,
              ),
            );

            // Build prompt for this creator
            const knowledgeSummary = getCreatorSummary(creatorId);
            const systemPrompt = buildSystemPrompt(
              knowledgeSummary,
              analysisContext,
              creatorInfo,
            );

            const chat = model.startChat({
              history,
              systemInstruction: {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
            });

            try {
              const result = await chat.sendMessageStream(userInput);

              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                  const data = JSON.stringify({
                    choices: [{ delta: { content: text } }],
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }
            } catch (creatorError) {
              console.error(
                `Error analyzing with ${creatorInfo.name}:`,
                creatorError,
              );
              const errorData = JSON.stringify({
                choices: [
                  {
                    delta: {
                      content: `\n\n⚠️ ${creatorInfo.name}の分析中にエラーが発生しました。\n`,
                    },
                  },
                ],
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            }

            // Send creator end marker
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "creator_end",
                  creatorId: creatorId,
                })}\n\n`,
              ),
            );
          }

          // プロフィール分析時：動画一覧をJSON形式で送信（カスタムUIで表示）
          if (videoListJson && videoListJson.length > 0) {
            const videoListData = JSON.stringify({
              type: "video_list",
              videos: videoListJson,
            });
            controller.enqueue(encoder.encode(`data: ${videoListData}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Multi-creator stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "不明なエラー";
    return new Response(
      JSON.stringify({ error: `サーバーエラー: ${message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// analyzeVideoWithProgress の戻り値型
interface AnalysisResult {
  context: string; // Gemini用コンテキスト
  videoListJson?: VideoItem[]; // プロフィール分析時のみ：動画一覧（JSON配列、UI用）
}

async function analyzeVideoWithProgress(
  url: string,
  platform: string,
  onProgress: (
    stage: string,
    percent?: number,
    current?: number,
    total?: number,
    steps?: ProgressStepType[],
  ) => void,
): Promise<AnalysisResult> {
  // Check if TikTok profile URL
  if (platform === "TikTok" && isTikTokProfileUrl(url)) {
    return await analyzeTikTokProfile(url, onProgress);
  }

  let context = `\n\n## 分析対象動画\n- URL: ${url}\n- プラットフォーム: ${platform}\n`;
  const errors: string[] = [];

  // プラットフォーム別のステップを定義
  const getStepsForPlatform = (
    plat: string,
  ): {
    steps: ProgressStepType[];
    hasInsight: boolean;
    hasDownload: boolean;
  } => {
    if (plat === "TikTok" || plat === "Instagram") {
      return {
        steps: [
          { id: "insight", label: "インサイト取得", status: "pending" },
          { id: "download", label: "動画ダウンロード", status: "pending" },
          { id: "analyze", label: "AI分析", status: "pending" },
          { id: "advice", label: "アドバイス生成", status: "pending" },
        ],
        hasInsight: true,
        hasDownload: true,
      };
    } else if (plat === "YouTube") {
      return {
        steps: [
          { id: "analyze", label: "動画分析", status: "pending" },
          { id: "advice", label: "アドバイス生成", status: "pending" },
        ],
        hasInsight: false,
        hasDownload: false,
      };
    } else {
      return {
        steps: [
          { id: "recognize", label: "URL認識", status: "pending" },
          { id: "advice", label: "アドバイス生成", status: "pending" },
        ],
        hasInsight: false,
        hasDownload: false,
      };
    }
  };

  const { steps, hasInsight, hasDownload } = getStepsForPlatform(platform);

  const updateStep = (
    id: string,
    status: ProgressStepType["status"],
    detail?: string,
  ) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      step.status = status;
      if (detail !== undefined) step.detail = detail;
    }
  };

  try {
    if (platform === "TikTok") {
      // Step 1: インサイト取得
      updateStep("insight", "in_progress");
      onProgress(
        "TikTokインサイトを取得中...",
        10,
        undefined,
        undefined,
        steps,
      );
      const insight = await getTikTokInsight(url);
      if (insight) {
        context += `\n### インサイト\n`;
        context += `- 再生数: ${insight.view?.toLocaleString() || "取得できず"}\n`;
        context += `- いいね: ${insight.like?.toLocaleString() || "取得できず"}\n`;
        context += `- コメント: ${insight.comment?.toLocaleString() || "取得できず"}\n`;
        context += `- シェア: ${insight.share?.toLocaleString() || "取得できず"}\n`;
        context += `- 保存: ${insight.save?.toLocaleString() || "取得できず"}\n`;
        context += `- 動画時間: ${insight.durationSec || "不明"}秒\n`;
        updateStep("insight", "completed");
      } else {
        updateStep("insight", "error");
        errors.push(
          "TikTokインサイトの取得に失敗しました（APIキー未設定または動画が非公開）",
        );
      }

      // Step 2: ダウンロード
      updateStep("download", "in_progress");
      onProgress("動画をダウンロード中...", 30, undefined, undefined, steps);
      const videoBuffer = await downloadTikTokVideo(url);
      if (videoBuffer) {
        updateStep("download", "completed");

        // Step 3: AI分析
        updateStep("analyze", "in_progress");
        onProgress("動画を分析中...", 50, undefined, undefined, steps);
        const analysis = await analyzeVideoWithGemini(videoBuffer);
        if (analysis) {
          context += `\n### Gemini動画分析結果\n${analysis}\n`;
          updateStep("analyze", "completed");
        } else {
          updateStep("analyze", "error");
          errors.push("動画の内容分析に失敗しました（Gemini APIエラー）");
        }
      } else {
        updateStep("download", "error");
        errors.push("動画のダウンロードに失敗しました");
      }

      // Step 4: アドバイス生成
      updateStep("advice", "in_progress");
      onProgress("アドバイスを生成中...", 80, undefined, undefined, steps);
    } else if (platform === "YouTube") {
      // Step 1: 動画分析
      updateStep("analyze", "in_progress");
      onProgress("YouTube動画を分析中...", 30, undefined, undefined, steps);
      const analysis = await analyzeYouTubeWithGemini(url);
      if (analysis) {
        context += `\n### Gemini動画分析結果\n${analysis}\n`;
        updateStep("analyze", "completed");
      } else {
        updateStep("analyze", "error");
        errors.push("YouTube動画の分析に失敗しました（Gemini APIエラー）");
      }

      // Step 2: アドバイス生成
      updateStep("advice", "in_progress");
      onProgress("アドバイスを生成中...", 70, undefined, undefined, steps);
    } else if (platform === "Instagram") {
      // Step 1: インサイト取得
      updateStep("insight", "in_progress");
      onProgress(
        "Instagramインサイトを取得中...",
        10,
        undefined,
        undefined,
        steps,
      );
      const insight = await getInstagramInsight(url);
      if (insight) {
        context += `\n### インサイト\n`;
        context += `- 再生数: ${insight.view?.toLocaleString() || "取得できず"}\n`;
        context += `- いいね: ${insight.like?.toLocaleString() || "取得できず"}\n`;
        context += `- コメント: ${insight.comment?.toLocaleString() || "取得できず"}\n`;
        context += `- シェア: ${insight.share?.toLocaleString() || "取得できず"}\n`;
        context += `- 動画時間: ${insight.durationSec || "不明"}秒\n`;
        updateStep("insight", "completed");
      } else {
        updateStep("insight", "error");
        errors.push(
          "Instagramインサイトの取得に失敗しました（APIキー未設定または動画が非公開）",
        );
      }

      // Step 2: ダウンロード
      updateStep("download", "in_progress");
      onProgress(
        "Instagram動画をダウンロード中...",
        30,
        undefined,
        undefined,
        steps,
      );
      const videoBuffer = await downloadInstagramVideo(url);
      if (videoBuffer) {
        updateStep("download", "completed");

        // Step 3: AI分析
        updateStep("analyze", "in_progress");
        onProgress("動画を分析中...", 50, undefined, undefined, steps);
        const analysis = await analyzeVideoWithGemini(videoBuffer);
        if (analysis) {
          context += `\n### Gemini動画分析結果\n${analysis}\n`;
          updateStep("analyze", "completed");
        } else {
          updateStep("analyze", "error");
          errors.push("動画の内容分析に失敗しました（Gemini APIエラー）");
        }
      } else {
        updateStep("download", "error");
        errors.push("Instagram動画のダウンロードに失敗しました");
      }

      // Step 4: アドバイス生成
      updateStep("advice", "in_progress");
      onProgress("アドバイスを生成中...", 80, undefined, undefined, steps);
    } else if (platform === "X") {
      // Step 1: URL認識
      updateStep("recognize", "in_progress");
      onProgress(
        `${platform}のURLを認識しました`,
        50,
        undefined,
        undefined,
        steps,
      );
      updateStep("recognize", "completed");
      errors.push(`${platform}は現在動画分析に対応していません（URLのみ認識）`);

      // Step 2: アドバイス生成
      updateStep("advice", "in_progress");
      onProgress("アドバイスを生成中...", 70, undefined, undefined, steps);
    }
  } catch (error) {
    console.error("Video analysis error:", error);
    errors.push("動画分析中に予期せぬエラーが発生しました");
  }

  if (errors.length > 0) {
    context += `\n### 分析の制限事項\n${errors.map((e) => `- ${e}`).join("\n")}\n`;
    context += `\n※ 上記の情報のみでアドバイスを行います。\n`;
  }

  return { context };
}

function buildSystemPrompt(
  knowledge: string,
  analysisContext: string,
  creatorInfo: CreatorInfo | null,
): string {
  const roleDescription = creatorInfo
    ? `あなたは「${creatorInfo.name}」の視点でアドバイスするBuzzTeacherです。
${creatorInfo.description}の観点から、具体的な改善点を提案してください。`
    : "あなたは「BuzzTeacher」、バズ動画のプロフェッショナルAIアシスタントです。";

  return `${roleDescription}

## あなたの役割
ショート動画をバズらせるための具体的なアドバイスを提供します。
以下のナレッジに基づいて、実践的で具体的な改善点を提案してください。

${knowledge}

${analysisContext}

## 回答のルール
1. 具体的な改善点を箇条書きで提示する
2. ナレッジに基づいた根拠を示す
3. すぐに実践できるアクションを提案する
4. 専門用語は避け、わかりやすく説明する
5. 動画URLが送られたら、分析結果に基づいてアドバイスする

## 回答フォーマット（動画分析時）
### 📊 現状評価
[インサイトに基づく評価]

### ✅ 良い点
[動画の強み]

### ⚠️ 改善点
[具体的な改善提案]

### 📝 構成案（タイムライン）
以下の表形式で、動画をアップデートするための構成案を提示してください：

| 時間 | 内容 | ポイント |
|------|------|----------|
| 0:00-0:02 | **フック** | [パワーワード、掴み] |
| 0:02-0:07 | **興味付け** | [問題提起、期待感] |
| 0:07-0:XX | **本編** | [ピンチ→解決の流れ] |
| ラスト | **コメント誘導** | [参加要素、問いかけ] |

※ 動画の尺に合わせて時間を調整してください

### 🎤 ナレーション案
以下のフォーマットで具体的なセリフを提案してください：

**[0:00-0:02] フック**
「[パワーワードを含む具体的なセリフ案]」
→ テロップ: [画面に表示するテキスト]

**[0:02-0:07] 興味付け**
「[期待感を煽るセリフ案]」

**[0:07-] 本編**
[展開の流れとキーセリフ]

**[ラスト] コメント誘導**
「[視聴者が反応したくなる問いかけ]」

### 💡 次のアクション
[すぐに実践できること]
`;
}

// Progress step type (for function signature)
interface ProgressStepType {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  detail?: string;
}

interface ProfileAnalysisResult {
  context: string; // Gemini用コンテキスト（サマリー + AI指示）
  videoListJson: VideoItem[]; // 動画一覧（JSON配列、UI用）
}

async function analyzeTikTokProfile(
  url: string,
  onProgress: (
    stage: string,
    percent?: number,
    current?: number,
    total?: number,
    steps?: ProgressStepType[],
  ) => void,
): Promise<ProfileAnalysisResult> {
  let context = "";
  let videoListJson: VideoItem[] = [];
  const errors: string[] = [];

  // ステップ管理
  const steps: ProgressStepType[] = [
    { id: "profile", label: "プロフィール情報を取得", status: "pending" },
    { id: "videos", label: "動画一覧を取得", status: "pending" },
    { id: "analyze", label: "動画を分析", status: "pending" },
    { id: "report", label: "レポート生成", status: "pending" },
  ];

  const updateStep = (
    id: string,
    status: ProgressStepType["status"],
    detail?: string,
  ) => {
    const step = steps.find((s) => s.id === id);
    if (step) {
      step.status = status;
      if (detail !== undefined) step.detail = detail;
    }
  };

  try {
    // Step 1: プロフィール取得
    updateStep("profile", "in_progress");
    onProgress("プロフィール情報を取得中...", 5, undefined, undefined, steps);
    const userVideos = await getTikTokUserVideos(url, 10);

    if (userVideos && userVideos.videos.length > 0) {
      updateStep("profile", "completed");
      updateStep("videos", "in_progress");
      updateStep("videos", "in_progress", `${userVideos.videos.length}件`);
      onProgress("動画一覧を取得中...", 10, undefined, undefined, steps);

      // 1. 定量分析：統計を計算
      const stats = calculateAccountStats(userVideos.videos);

      // 2. 定量分析レポート生成
      context = generateQuantitativeReport(stats, userVideos.username);

      updateStep("videos", "completed", `${userVideos.videos.length}件`);
      updateStep("analyze", "in_progress");
      onProgress("動画を分析中...", 15, undefined, undefined, steps);

      // 3. 動画分析（5件ずつ並列）- ステップ付きコールバック
      const analysisResults = await analyzeVideosInBatches(
        userVideos.videos,
        5,
        (stage, percent, current, total) => {
          if (current !== undefined && total !== undefined) {
            updateStep("analyze", "in_progress", `${current}/${total}`);
          }
          onProgress(stage, percent, current, total, steps);
        },
      );

      // 4. 定性分析プロンプト生成
      context += generateQualitativePrompt(analysisResults);

      // 5. 動画ランキング生成（Top3 + Worst1をコンテキストに、全動画詳細はJSON配列）
      const { ranking, videoListJson: videoList } = generateVideoRanking(
        userVideos.videos,
        analysisResults,
      );
      context += ranking;
      videoListJson = videoList;

      // 6. AI向け指示を追加
      updateStep("analyze", "completed", `${userVideos.videos.length}件完了`);
      updateStep("report", "in_progress");
      onProgress("レポートを生成中...", 90, undefined, undefined, steps);
      context += `
---

## AI分析指示

上記のデータを踏まえて、以下のセクションを**具体的に**埋めてください：

1. **エグゼクティブサマリー**: 3-5行で全体評価と主要改善ポイントを要約
2. **定性分析（3.1〜3.3）**: 表の「*AI分析*」「*AI評価*」部分を具体的な内容で置き換え
3. **改善提案（5章）**: 優先度別に具体的なアクションを提案
4. **次のアクション（6章）**: チェックリスト形式で実践項目を提案

**注意**:
- 定量データに基づいた根拠を示す
- 業界平均比較を活用して評価する
- 具体的な改善例を挙げる（例: 「フックを〇〇に変更」）
- 実践可能なアクションを優先する

※ 全動画の詳細分析は、このレポートの後に自動で出力されます。
`;

      updateStep("report", "completed");
      onProgress("分析完了", 100, undefined, undefined, steps);
    } else {
      // エラー時もステップを更新
      updateStep("profile", "error", "取得失敗");
      onProgress(
        "プロフィール取得に失敗しました",
        0,
        undefined,
        undefined,
        steps,
      );
      errors.push(
        "プロフィール情報の取得に失敗しました（APIキー未設定またはアカウントが非公開）",
      );
    }
  } catch (error) {
    console.error("Profile analysis error:", error);
    // エラー時もステップを更新
    updateStep("profile", "error", "エラー発生");
    onProgress("分析中にエラーが発生しました", 0, undefined, undefined, steps);
    errors.push("プロフィール分析中に予期せぬエラーが発生しました");
  }

  if (errors.length > 0) {
    context += `\n### 分析の制限事項\n${errors.map((e) => `- ${e}`).join("\n")}\n`;
    context += `\n※ URLのみでアドバイスを行います。\n`;
  }

  return { context, videoListJson };
}

async function analyzeVideosInBatches(
  videos: TikTokVideo[],
  batchSize: number,
  onProgress: (
    stage: string,
    percent?: number,
    current?: number,
    total?: number,
  ) => void,
): Promise<VideoAnalysisResult[]> {
  const results: VideoAnalysisResult[] = [];
  const total = videos.length;

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    const startIdx = i + 1;
    const endIdx = Math.min(i + batchSize, videos.length);
    const percent = Math.round((i / total) * 100);
    onProgress(
      `動画分析中... (${startIdx}-${endIdx}/${total})`,
      percent,
      startIdx,
      total,
    );

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (video): Promise<VideoAnalysisResult> => {
        try {
          const buffer = await downloadTikTokVideo(video.url);
          if (!buffer) {
            return {
              videoId: video.id,
              videoUrl: video.url,
              desc: video.desc,
              stats: {
                playCount: video.stats.playCount,
                likeCount: video.stats.likeCount,
                commentCount: video.stats.commentCount,
                shareCount: video.stats.shareCount,
              },
              analysis: null,
              error: "ダウンロード失敗",
            };
          }

          const analysis = await analyzeVideoWithGemini(buffer);
          return {
            videoId: video.id,
            videoUrl: video.url,
            desc: video.desc,
            stats: {
              playCount: video.stats.playCount,
              likeCount: video.stats.likeCount,
              commentCount: video.stats.commentCount,
              shareCount: video.stats.shareCount,
            },
            analysis,
            error: analysis ? undefined : "Gemini分析失敗",
          };
        } catch (error) {
          console.error(`Video analysis error for ${video.id}:`, error);
          return {
            videoId: video.id,
            videoUrl: video.url,
            desc: video.desc,
            stats: {
              playCount: video.stats.playCount,
              likeCount: video.stats.likeCount,
              commentCount: video.stats.commentCount,
              shareCount: video.stats.shareCount,
            },
            analysis: null,
            error: "分析中にエラー発生",
          };
        }
      }),
    );

    results.push(...batchResults);

    // バッチ完了時の進捗更新
    const completedCount = Math.min(i + batchSize, total);
    const completedPercent = Math.round((completedCount / total) * 100);
    onProgress(
      `動画${completedCount}/${total}完了`,
      completedPercent,
      completedCount,
      total,
    );
  }

  return results;
}
