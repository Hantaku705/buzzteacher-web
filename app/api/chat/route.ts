import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { detectPlatform, extractVideoUrl, isTikTokProfileUrl } from '@/lib/utils/platform'
import { getTikTokInsight, downloadTikTokVideo, getTikTokUserVideos } from '@/lib/api/tiktok'
import { getInstagramInsight, downloadInstagramVideo } from '@/lib/api/instagram'
import { analyzeVideoWithGemini, analyzeYouTubeWithGemini } from '@/lib/api/gemini'
import { getKnowledgeSummary, getCreatorSummary, AVAILABLE_CREATORS, CreatorInfo } from '@/lib/knowledge/loader'

export async function POST(req: NextRequest) {
  try {
    const { messages, creators } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage.content

    // Check if user sent a video URL
    const videoUrl = extractVideoUrl(userInput)
    const platform = videoUrl ? detectPlatform(videoUrl) : null

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY が設定されていません' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Convert messages to Gemini format (excluding the last message)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const encoder = new TextEncoder()

    // Determine creators to analyze
    const creatorsToAnalyze: string[] = creators && creators.length > 0
      ? creators
      : ['doshirouto']

    // Helper to send progress events
    const sendProgress = (controller: ReadableStreamDefaultController, stage: string) => {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', stage })}\n\n`))
    }

    // Single creator: use simple streaming (backward compatible)
    if (creatorsToAnalyze.length === 1) {
      const creatorId = creatorsToAnalyze[0]
      const knowledgeSummary = getCreatorSummary(creatorId)
      const creatorInfo = AVAILABLE_CREATORS.find(c => c.id === creatorId) || null

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Analyze video with progress updates
            let analysisContext = ''
            if (videoUrl && platform) {
              analysisContext = await analyzeVideoWithProgress(videoUrl, platform, (stage) => sendProgress(controller, stage))
            }

            sendProgress(controller, 'アドバイスを生成中...')

            const systemPrompt = buildSystemPrompt(knowledgeSummary, analysisContext, creatorInfo)
            const chat = model.startChat({
              history,
              systemInstruction: {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
            })

            const result = await chat.sendMessageStream(userInput)

            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                const data = JSON.stringify({
                  choices: [{ delta: { content: text } }]
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Stream error:', error)
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Multiple creators: sequential streaming with markers
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Analyze video with progress updates (only once for all creators)
          let analysisContext = ''
          if (videoUrl && platform) {
            analysisContext = await analyzeVideoWithProgress(videoUrl, platform, (stage) => sendProgress(controller, stage))
          }

          for (const creatorId of creatorsToAnalyze) {
            const creatorInfo = AVAILABLE_CREATORS.find(c => c.id === creatorId)
            if (!creatorInfo) continue

            // Send creator start marker
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'creator_start',
              creatorId: creatorId,
              name: creatorInfo.name
            })}\n\n`))

            // Build prompt for this creator
            const knowledgeSummary = getCreatorSummary(creatorId)
            const systemPrompt = buildSystemPrompt(knowledgeSummary, analysisContext, creatorInfo)

            const chat = model.startChat({
              history,
              systemInstruction: {
                role: 'user',
                parts: [{ text: systemPrompt }],
              },
            })

            try {
              const result = await chat.sendMessageStream(userInput)

              for await (const chunk of result.stream) {
                const text = chunk.text()
                if (text) {
                  const data = JSON.stringify({
                    choices: [{ delta: { content: text } }]
                  })
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                }
              }
            } catch (creatorError) {
              console.error(`Error analyzing with ${creatorInfo.name}:`, creatorError)
              const errorData = JSON.stringify({
                choices: [{ delta: { content: `\n\n⚠️ ${creatorInfo.name}の分析中にエラーが発生しました。\n` } }]
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            }

            // Send creator end marker
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'creator_end',
              creatorId: creatorId
            })}\n\n`))
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Multi-creator stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : '不明なエラー'
    return new Response(JSON.stringify({ error: `サーバーエラー: ${message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function analyzeVideoWithProgress(
  url: string,
  platform: string,
  onProgress: (stage: string) => void
): Promise<string> {
  // Check if TikTok profile URL
  if (platform === 'TikTok' && isTikTokProfileUrl(url)) {
    return await analyzeTikTokProfile(url, onProgress)
  }

  let context = `\n\n## 分析対象動画\n- URL: ${url}\n- プラットフォーム: ${platform}\n`
  const errors: string[] = []

  try {
    if (platform === 'TikTok') {
      onProgress('TikTokインサイトを取得中...')
      const insight = await getTikTokInsight(url)
      if (insight) {
        context += `\n### インサイト\n`
        context += `- 再生数: ${insight.view?.toLocaleString() || '取得できず'}\n`
        context += `- いいね: ${insight.like?.toLocaleString() || '取得できず'}\n`
        context += `- コメント: ${insight.comment?.toLocaleString() || '取得できず'}\n`
        context += `- シェア: ${insight.share?.toLocaleString() || '取得できず'}\n`
        context += `- 保存: ${insight.save?.toLocaleString() || '取得できず'}\n`
        context += `- 動画時間: ${insight.durationSec || '不明'}秒\n`
      } else {
        errors.push('TikTokインサイトの取得に失敗しました（APIキー未設定または動画が非公開）')
      }

      onProgress('動画をダウンロード中...')
      const videoBuffer = await downloadTikTokVideo(url)
      if (videoBuffer) {
        onProgress('動画を分析中...')
        const analysis = await analyzeVideoWithGemini(videoBuffer)
        if (analysis) {
          context += `\n### Gemini動画分析結果\n${analysis}\n`
        } else {
          errors.push('動画の内容分析に失敗しました（Gemini APIエラー）')
        }
      } else {
        errors.push('動画のダウンロードに失敗しました')
      }
    } else if (platform === 'YouTube') {
      onProgress('YouTube動画を分析中...')
      const analysis = await analyzeYouTubeWithGemini(url)
      if (analysis) {
        context += `\n### Gemini動画分析結果\n${analysis}\n`
      } else {
        errors.push('YouTube動画の分析に失敗しました（Gemini APIエラー）')
      }
    } else if (platform === 'Instagram') {
      onProgress('Instagramインサイトを取得中...')
      const insight = await getInstagramInsight(url)
      if (insight) {
        context += `\n### インサイト\n`
        context += `- 再生数: ${insight.view?.toLocaleString() || '取得できず'}\n`
        context += `- いいね: ${insight.like?.toLocaleString() || '取得できず'}\n`
        context += `- コメント: ${insight.comment?.toLocaleString() || '取得できず'}\n`
        context += `- シェア: ${insight.share?.toLocaleString() || '取得できず'}\n`
        context += `- 動画時間: ${insight.durationSec || '不明'}秒\n`
      } else {
        errors.push('Instagramインサイトの取得に失敗しました（APIキー未設定または動画が非公開）')
      }

      onProgress('Instagram動画をダウンロード中...')
      const videoBuffer = await downloadInstagramVideo(url)
      if (videoBuffer) {
        onProgress('動画を分析中...')
        const analysis = await analyzeVideoWithGemini(videoBuffer)
        if (analysis) {
          context += `\n### Gemini動画分析結果\n${analysis}\n`
        } else {
          errors.push('動画の内容分析に失敗しました（Gemini APIエラー）')
        }
      } else {
        errors.push('Instagram動画のダウンロードに失敗しました')
      }
    } else if (platform === 'X') {
      onProgress(`${platform}のURLを認識しました`)
      errors.push(`${platform}は現在動画分析に対応していません（URLのみ認識）`)
    }
  } catch (error) {
    console.error('Video analysis error:', error)
    errors.push('動画分析中に予期せぬエラーが発生しました')
  }

  if (errors.length > 0) {
    context += `\n### 分析の制限事項\n${errors.map(e => `- ${e}`).join('\n')}\n`
    context += `\n※ 上記の情報のみでアドバイスを行います。\n`
  }

  return context
}

function buildSystemPrompt(
  knowledge: string,
  analysisContext: string,
  creatorInfo: CreatorInfo | null
): string {
  const roleDescription = creatorInfo
    ? `あなたは「${creatorInfo.name}」の視点でアドバイスするBuzzTeacherです。
${creatorInfo.description}の観点から、具体的な改善点を提案してください。`
    : 'あなたは「BuzzTeacher」、バズ動画のプロフェッショナルAIアシスタントです。'

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

### 💡 次のアクション
[すぐに実践できること]
`
}

async function analyzeTikTokProfile(
  url: string,
  onProgress: (stage: string) => void
): Promise<string> {
  let context = `\n\n## 分析対象プロフィール\n- URL: ${url}\n- プラットフォーム: TikTok\n`
  const errors: string[] = []

  try {
    onProgress('TikTokプロフィール情報を取得中...')
    const userVideos = await getTikTokUserVideos(url, 10)

    if (userVideos && userVideos.videos.length > 0) {
      context += `\n### ユーザー: @${userVideos.username}\n`
      context += `\n### 最新動画一覧（${userVideos.videos.length}件）\n`

      // Calculate total stats
      let totalViews = 0
      let totalLikes = 0
      let totalComments = 0
      let totalShares = 0

      userVideos.videos.forEach((video, index) => {
        totalViews += video.stats.playCount
        totalLikes += video.stats.likeCount
        totalComments += video.stats.commentCount
        totalShares += video.stats.shareCount

        const date = new Date(video.createTime * 1000).toLocaleDateString('ja-JP')
        context += `\n#### ${index + 1}. ${video.desc.slice(0, 50) || '(説明なし)'}${video.desc.length > 50 ? '...' : ''}\n`
        context += `- URL: ${video.url}\n`
        context += `- 投稿日: ${date}\n`
        context += `- 再生: ${video.stats.playCount.toLocaleString()}\n`
        context += `- いいね: ${video.stats.likeCount.toLocaleString()}\n`
        context += `- コメント: ${video.stats.commentCount.toLocaleString()}\n`
        context += `- シェア: ${video.stats.shareCount.toLocaleString()}\n`
        context += `- 保存: ${video.stats.collectCount.toLocaleString()}\n`
        context += `- 動画時間: ${video.durationSec}秒\n`
      })

      // Add summary stats
      const avgViews = Math.round(totalViews / userVideos.videos.length)
      const avgLikes = Math.round(totalLikes / userVideos.videos.length)
      const avgEngagement = totalViews > 0
        ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2)
        : '0'

      context += `\n### サマリー統計\n`
      context += `- 総再生数: ${totalViews.toLocaleString()}\n`
      context += `- 平均再生数: ${avgViews.toLocaleString()}\n`
      context += `- 総いいね数: ${totalLikes.toLocaleString()}\n`
      context += `- 平均いいね数: ${avgLikes.toLocaleString()}\n`
      context += `- 平均エンゲージメント率: ${avgEngagement}%\n`

      // Find best performing video
      const bestVideo = userVideos.videos.reduce((best, current) =>
        current.stats.playCount > best.stats.playCount ? current : best
      )
      context += `\n### 最高再生動画\n`
      context += `- タイトル: ${bestVideo.desc.slice(0, 50) || '(説明なし)'}\n`
      context += `- URL: ${bestVideo.url}\n`
      context += `- 再生数: ${bestVideo.stats.playCount.toLocaleString()}\n`
    } else {
      errors.push('プロフィール情報の取得に失敗しました（APIキー未設定またはアカウントが非公開）')
    }
  } catch (error) {
    console.error('Profile analysis error:', error)
    errors.push('プロフィール分析中に予期せぬエラーが発生しました')
  }

  if (errors.length > 0) {
    context += `\n### 分析の制限事項\n${errors.map(e => `- ${e}`).join('\n')}\n`
    context += `\n※ URLのみでアドバイスを行います。\n`
  }

  return context
}
