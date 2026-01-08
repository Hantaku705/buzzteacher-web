import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { detectPlatform, extractVideoUrl } from '@/lib/utils/platform'
import { getTikTokInsight, downloadTikTokVideo } from '@/lib/api/tiktok'
import { analyzeVideoWithGemini, analyzeYouTubeWithGemini } from '@/lib/api/gemini'
import { getKnowledgeSummary } from '@/lib/knowledge/loader'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage.content

    // Check if user sent a video URL
    const videoUrl = extractVideoUrl(userInput)
    let analysisContext = ''

    if (videoUrl) {
      const platform = detectPlatform(videoUrl)

      if (platform) {
        analysisContext = await analyzeVideo(videoUrl, platform)
      }
    }

    // Build system prompt
    const knowledgeSummary = getKnowledgeSummary()
    const systemPrompt = buildSystemPrompt(knowledgeSummary, analysisContext)

    // Stream response
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

async function analyzeVideo(url: string, platform: string): Promise<string> {
  let context = `\n\n## 分析対象動画\n- URL: ${url}\n- プラットフォーム: ${platform}\n`

  try {
    if (platform === 'TikTok') {
      // Get insight
      const insight = await getTikTokInsight(url)
      if (insight) {
        context += `\n### インサイト\n`
        context += `- 再生数: ${insight.view?.toLocaleString() || '取得できず'}\n`
        context += `- いいね: ${insight.like?.toLocaleString() || '取得できず'}\n`
        context += `- コメント: ${insight.comment?.toLocaleString() || '取得できず'}\n`
        context += `- シェア: ${insight.share?.toLocaleString() || '取得できず'}\n`
        context += `- 保存: ${insight.save?.toLocaleString() || '取得できず'}\n`
        context += `- 動画時間: ${insight.durationSec || '不明'}秒\n`
      }

      // Download and analyze
      const videoBuffer = await downloadTikTokVideo(url)
      if (videoBuffer) {
        const analysis = await analyzeVideoWithGemini(videoBuffer)
        if (analysis) {
          context += `\n### Gemini動画分析結果\n${analysis}\n`
        }
      }
    } else if (platform === 'YouTube') {
      const analysis = await analyzeYouTubeWithGemini(url)
      if (analysis) {
        context += `\n### Gemini動画分析結果\n${analysis}\n`
      }
    }
  } catch (error) {
    console.error('Video analysis error:', error)
    context += `\n※ 動画分析中にエラーが発生しました\n`
  }

  return context
}

function buildSystemPrompt(knowledge: string, analysisContext: string): string {
  return `あなたは「BuzzTeacher」、バズ動画のプロフェッショナルAIアシスタントです。

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

### 💡 次のアクション
[すぐに実践できること]
`
}
