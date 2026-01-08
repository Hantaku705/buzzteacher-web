export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

export interface InsightData {
  url: string
  platform: 'TikTok' | 'YouTube' | 'Instagram' | 'X'
  view: number | null
  like: number | null
  comment: number | null
  share: number | null
  save: number | null
  durationSec: number | null
  thumbnail?: string
}

export interface AnalysisResult {
  narration: string
  telop: string
  cutCount: number
  hookContent: string
  compositionPlan: string
  secPerCut: number
}
