import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { detectPlatform, extractVideoUrl, isTikTokProfileUrl } from '@/lib/utils/platform'
import { getTikTokInsight, downloadTikTokVideo, getTikTokUserVideos, TikTokVideo } from '@/lib/api/tiktok'
import { getInstagramInsight, downloadInstagramVideo } from '@/lib/api/instagram'
import { analyzeVideoWithGemini, analyzeYouTubeWithGemini } from '@/lib/api/gemini'
import { getKnowledgeSummary, getCreatorSummary, AVAILABLE_CREATORS, CreatorInfo } from '@/lib/knowledge/loader'
import { VideoAnalysisResult } from '@/lib/types'

// アカウント統計のインターフェース
interface AccountStats {
  // 基本指標
  videoCount: number
  totalViews: number
  avgViews: number
  totalLikes: number
  avgLikes: number

  // エンゲージメント詳細
  lvr: number  // Like-to-View Ratio (%)
  cvr: number  // Comment-to-View Ratio (%)
  svr: number  // Share-to-View Ratio (%)
  saveRate: number  // Save Rate (%)
  totalEngagementRate: number  // 総合エンゲージメント率

  // パフォーマンス分布
  maxViews: number
  minViews: number
  medianViews: number
  stdDevViews: number
  buzzVideoRate: number  // 平均の2倍超の割合(%)

  // 時系列
  postingFrequency: string
  avgDaysBetweenPosts: number
}

// TikTok業界平均値（参考値）
const INDUSTRY_BENCHMARKS = {
  lvr: 4.5,      // いいね率 4.5%
  cvr: 0.2,      // コメント率 0.2%
  svr: 0.15,     // シェア率 0.15%
  saveRate: 0.5, // 保存率 0.5%
}

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
      postingFrequency: '不明',
      avgDaysBetweenPosts: 0,
    }
  }

  // 基本集計
  let totalViews = 0
  let totalLikes = 0
  let totalComments = 0
  let totalShares = 0
  let totalSaves = 0
  const viewsList: number[] = []

  videos.forEach((video) => {
    totalViews += video.stats.playCount
    totalLikes += video.stats.likeCount
    totalComments += video.stats.commentCount
    totalShares += video.stats.shareCount
    totalSaves += video.stats.collectCount || 0
    viewsList.push(video.stats.playCount)
  })

  const avgViews = Math.round(totalViews / videos.length)
  const avgLikes = Math.round(totalLikes / videos.length)

  // エンゲージメント率計算
  const lvr = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0
  const cvr = totalViews > 0 ? (totalComments / totalViews) * 100 : 0
  const svr = totalViews > 0 ? (totalShares / totalViews) * 100 : 0
  const saveRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0
  const totalEngagementRate = totalViews > 0
    ? ((totalLikes + totalComments + totalShares + totalSaves) / totalViews) * 100
    : 0

  // パフォーマンス分布
  const sortedViews = [...viewsList].sort((a, b) => a - b)
  const maxViews = sortedViews[sortedViews.length - 1]
  const minViews = sortedViews[0]
  const medianViews = sortedViews.length % 2 === 0
    ? Math.round((sortedViews[sortedViews.length / 2 - 1] + sortedViews[sortedViews.length / 2]) / 2)
    : sortedViews[Math.floor(sortedViews.length / 2)]

  // 標準偏差
  const variance = viewsList.reduce((sum, v) => sum + Math.pow(v - avgViews, 2), 0) / viewsList.length
  const stdDevViews = Math.round(Math.sqrt(variance))

  // バズ動画率（平均の2倍超）
  const buzzThreshold = avgViews * 2
  const buzzVideoCount = viewsList.filter(v => v > buzzThreshold).length
  const buzzVideoRate = (buzzVideoCount / videos.length) * 100

  // 投稿頻度計算
  let postingFrequency = '不明'
  let avgDaysBetweenPosts = 0
  if (videos.length >= 2) {
    const timestamps = videos.map(v => v.createTime).sort((a, b) => b - a)
    const daysDiff = (timestamps[0] - timestamps[timestamps.length - 1]) / (60 * 60 * 24)
    avgDaysBetweenPosts = daysDiff / (videos.length - 1)

    if (avgDaysBetweenPosts <= 1) {
      postingFrequency = '毎日'
    } else if (avgDaysBetweenPosts <= 2) {
      postingFrequency = '2日に1回'
    } else if (avgDaysBetweenPosts <= 3.5) {
      postingFrequency = '週2-3回'
    } else if (avgDaysBetweenPosts <= 7) {
      postingFrequency = '週1回'
    } else if (avgDaysBetweenPosts <= 14) {
      postingFrequency = '2週に1回'
    } else {
      postingFrequency = '月1-2回'
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
  }
}

// 業界平均との比較評価
function getComparisonLabel(value: number, benchmark: number): string {
  const ratio = value / benchmark
  if (ratio >= 1.5) return '🔥 優秀'
  if (ratio >= 1.0) return '✅ 平均以上'
  if (ratio >= 0.7) return '➖ 平均'
  return '⚠️ 要改善'
}

// 定量分析レポート生成
function generateQuantitativeReport(stats: AccountStats, username: string): string {
  const today = new Date().toISOString().split('T')[0]

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

`
  return report
}

// 動画ランキング生成
function generateVideoRanking(
  videos: TikTokVideo[],
  analysisResults: VideoAnalysisResult[]
): string {
  // 再生数でソート
  const sortedVideos = [...videos].sort((a, b) => b.stats.playCount - a.stats.playCount)
  const top3 = sortedVideos.slice(0, 3)
  const worst = sortedVideos[sortedVideos.length - 1]

  // 分析結果をマップ化
  const analysisMap = new Map<string, VideoAnalysisResult>()
  analysisResults.forEach(r => analysisMap.set(r.videoId, r))

  let report = `## 4. 動画別分析（Top 3 + 要改善 1）

`

  // Top 3
  const medals = ['🏆', '🥈', '🥉']
  top3.forEach((video, index) => {
    const er = video.stats.playCount > 0
      ? ((video.stats.likeCount + video.stats.commentCount + video.stats.shareCount) / video.stats.playCount * 100).toFixed(2)
      : '0'
    const analysis = analysisMap.get(video.id)

    report += `### ${medals[index]} ${index + 1}位: ${video.desc.slice(0, 40) || '(説明なし)'}${video.desc.length > 40 ? '...' : ''}
- **再生**: ${video.stats.playCount.toLocaleString()} / **いいね**: ${video.stats.likeCount.toLocaleString()} / **ER**: ${er}%
- URL: ${video.url}
${analysis?.analysis ? `- **AI分析**: ${analysis.analysis.slice(0, 200)}...` : ''}

`
  })

  // Worst
  if (worst && worst.id !== top3[top3.length - 1]?.id) {
    const worstEr = worst.stats.playCount > 0
      ? ((worst.stats.likeCount + worst.stats.commentCount + worst.stats.shareCount) / worst.stats.playCount * 100).toFixed(2)
      : '0'
    const worstAnalysis = analysisMap.get(worst.id)

    report += `### ⚠️ 要改善: ${worst.desc.slice(0, 40) || '(説明なし)'}${worst.desc.length > 40 ? '...' : ''}
- **再生**: ${worst.stats.playCount.toLocaleString()} / **いいね**: ${worst.stats.likeCount.toLocaleString()} / **ER**: ${worstEr}%
- URL: ${worst.url}
${worstAnalysis?.analysis ? `- **AI分析**: ${worstAnalysis.analysis.slice(0, 200)}...` : ''}

`
  }

  report += `---

`
  return report
}

// 定性分析プロンプト生成
function generateQualitativePrompt(analysisResults: VideoAnalysisResult[]): string {
  const successfulAnalyses = analysisResults.filter(r => r.analysis).length

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

`

  // 各動画の分析詳細を追加
  analysisResults.forEach((result, index) => {
    report += `### 動画${index + 1}: ${result.desc.slice(0, 50) || '(説明なし)'}
- URL: ${result.videoUrl}
- 再生: ${result.stats.playCount.toLocaleString()} / いいね: ${result.stats.likeCount.toLocaleString()}

${result.analysis ? `**Gemini分析:**\n${result.analysis}\n` : `**分析エラー:** ${result.error || '不明'}\n`}
`
  })

  return report
}

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

    // Progress step type
    interface ProgressStep {
      id: string
      label: string
      status: 'pending' | 'in_progress' | 'completed' | 'error'
      detail?: string
    }

    // Helper to send progress events (with optional percent, current, total, steps)
    const sendProgress = (
      controller: ReadableStreamDefaultController,
      stage: string,
      percent?: number,
      current?: number,
      total?: number,
      steps?: ProgressStep[]
    ) => {
      const event: {
        type: string
        stage: string
        percent?: number
        current?: number
        total?: number
        steps?: ProgressStep[]
      } = {
        type: 'progress',
        stage
      }
      if (percent !== undefined) event.percent = percent
      if (current !== undefined) event.current = current
      if (total !== undefined) event.total = total
      if (steps) event.steps = steps
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
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
              analysisContext = await analyzeVideoWithProgress(
                videoUrl,
                platform,
                (stage, percent, current, total, steps) => sendProgress(controller, stage, percent, current, total, steps)
              )
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
            analysisContext = await analyzeVideoWithProgress(
              videoUrl,
              platform,
              (stage, percent, current, total, steps) => sendProgress(controller, stage, percent, current, total, steps)
            )
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
  onProgress: (stage: string, percent?: number, current?: number, total?: number, steps?: ProgressStepType[]) => void
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

// Progress step type (for function signature)
interface ProgressStepType {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  detail?: string
}

async function analyzeTikTokProfile(
  url: string,
  onProgress: (stage: string, percent?: number, current?: number, total?: number, steps?: ProgressStepType[]) => void
): Promise<string> {
  let context = ''
  const errors: string[] = []

  // ステップ管理
  const steps: ProgressStepType[] = [
    { id: 'profile', label: 'プロフィール情報を取得', status: 'pending' },
    { id: 'videos', label: '動画一覧を取得', status: 'pending' },
    { id: 'analyze', label: '動画を分析', status: 'pending' },
    { id: 'report', label: 'レポート生成', status: 'pending' },
  ]

  const updateStep = (id: string, status: ProgressStepType['status'], detail?: string) => {
    const step = steps.find(s => s.id === id)
    if (step) {
      step.status = status
      if (detail !== undefined) step.detail = detail
    }
  }

  try {
    // Step 1: プロフィール取得
    updateStep('profile', 'in_progress')
    onProgress('プロフィール情報を取得中...', 5, undefined, undefined, steps)
    const userVideos = await getTikTokUserVideos(url, 10)

    if (userVideos && userVideos.videos.length > 0) {
      updateStep('profile', 'completed')
      updateStep('videos', 'in_progress')
      updateStep('videos', 'in_progress', `${userVideos.videos.length}件`)
      onProgress('動画一覧を取得中...', 10, undefined, undefined, steps)

      // 1. 定量分析：統計を計算
      const stats = calculateAccountStats(userVideos.videos)

      // 2. 定量分析レポート生成
      context = generateQuantitativeReport(stats, userVideos.username)

      updateStep('videos', 'completed', `${userVideos.videos.length}件`)
      updateStep('analyze', 'in_progress')
      onProgress('動画を分析中...', 15, undefined, undefined, steps)

      // 3. 動画分析（5件ずつ並列）- ステップ付きコールバック
      const analysisResults = await analyzeVideosInBatches(
        userVideos.videos,
        5,
        (stage, percent, current, total) => {
          if (current !== undefined && total !== undefined) {
            updateStep('analyze', 'in_progress', `${current}/${total}`)
          }
          onProgress(stage, percent, current, total, steps)
        }
      )

      // 4. 定性分析プロンプト生成
      context += generateQualitativePrompt(analysisResults)

      // 5. 動画ランキング生成
      context += generateVideoRanking(userVideos.videos, analysisResults)

      // 6. AI向け指示を追加
      updateStep('analyze', 'completed', `${userVideos.videos.length}件完了`)
      updateStep('report', 'in_progress')
      onProgress('レポートを生成中...', 90, undefined, undefined, steps)
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
`

      updateStep('report', 'completed')
      onProgress('分析完了', 100, undefined, undefined, steps)
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

async function analyzeVideosInBatches(
  videos: TikTokVideo[],
  batchSize: number,
  onProgress: (stage: string, percent?: number, current?: number, total?: number) => void
): Promise<VideoAnalysisResult[]> {
  const results: VideoAnalysisResult[] = []
  const total = videos.length

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize)
    const startIdx = i + 1
    const endIdx = Math.min(i + batchSize, videos.length)
    const percent = Math.round((i / total) * 100)
    onProgress(`動画分析中... (${startIdx}-${endIdx}/${total})`, percent, startIdx, total)

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (video): Promise<VideoAnalysisResult> => {
        try {
          const buffer = await downloadTikTokVideo(video.url)
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
              error: 'ダウンロード失敗',
            }
          }

          const analysis = await analyzeVideoWithGemini(buffer)
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
            error: analysis ? undefined : 'Gemini分析失敗',
          }
        } catch (error) {
          console.error(`Video analysis error for ${video.id}:`, error)
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
            error: '分析中にエラー発生',
          }
        }
      })
    )

    results.push(...batchResults)

    // バッチ完了時の進捗更新
    const completedCount = Math.min(i + batchSize, total)
    const completedPercent = Math.round((completedCount / total) * 100)
    onProgress(`動画${completedCount}/${total}完了`, completedPercent, completedCount, total)
  }

  return results
}
