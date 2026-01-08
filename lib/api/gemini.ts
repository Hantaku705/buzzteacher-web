import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// 遅延初期化でエラーを防ぐ
function getModel() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

function getFileManager() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return new GoogleAIFileManager(GEMINI_API_KEY)
}

export async function analyzeVideoWithGemini(
  videoBuffer: Buffer,
  mimeType: string = 'video/mp4'
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured')
    return null
  }

  try {
    const fileManager = getFileManager()
    const model = getModel()

    // Save to temp file
    const tempDir = join(tmpdir(), 'buzzteacher')
    await mkdir(tempDir, { recursive: true })
    const filePath = join(tempDir, `video_${Date.now()}.mp4`)
    await writeFile(filePath, videoBuffer)

    // Upload to Gemini
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: `video-${Date.now()}`,
    })

    // Wait for processing
    let file = uploadResult.file
    while (file.state === FileState.PROCESSING) {
      await new Promise((r) => setTimeout(r, 2000))
      file = await fileManager.getFile(file.name)
    }

    if (file.state === FileState.FAILED) {
      throw new Error('Video processing failed')
    }

    // Analyze
    const result = await getModel().generateContent([
      {
        fileData: {
          mimeType,
          fileUri: file.uri,
        },
      },
      {
        text: ANALYSIS_PROMPT,
      },
    ])

    // Cleanup
    await unlink(filePath).catch(() => {})

    return result.response.text()
  } catch (error) {
    console.error('Failed to analyze video with Gemini:', error)
    return null
  }
}

export async function analyzeYouTubeWithGemini(youtubeUrl: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured')
    return null
  }

  try {
    const result = await getModel().generateContent([
      {
        text: `以下のYouTube動画を分析してください。\n動画URL: ${youtubeUrl}\n\n${ANALYSIS_PROMPT}`,
      },
    ])

    return result.response.text()
  } catch (error) {
    console.error('Failed to analyze YouTube with Gemini:', error)
    return null
  }
}

const ANALYSIS_PROMPT = `
この動画を分析して、以下の情報を日本語で出力してください：

## 動画内容
- ナレーション（音声の文字起こし）
- テロップ（画面に表示されるテキスト）
- カット数と秒/カット

## 構成分析
- 冒頭3秒のフック内容
- 全体の構成（型名と流れ）
- 見どころ・ピーク

## バズ要因分析
- フックの強さ（視聴を止める力）
- 稀有度（見たことない度合い）
- 情報密度（テンポ感）
- コメント誘導の仕掛け

分析結果は簡潔にまとめてください。
`
