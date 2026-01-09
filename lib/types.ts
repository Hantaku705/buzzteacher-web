export interface CreatorSection {
  creatorId: string
  creatorName: string
  content: string
  isStreaming?: boolean
}

export interface Message {
  id: string
  conversation_id?: string
  role: 'user' | 'assistant'
  content: string
  creators?: string[]
  createdAt: Date
  creatorSections?: CreatorSection[]
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  creators?: string[]
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
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

export interface VideoAnalysisResult {
  videoId: string
  videoUrl: string
  desc: string
  stats: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
  }
  analysis: string | null
  error?: string
}
