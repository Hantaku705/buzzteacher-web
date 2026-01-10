export interface CreatorSection {
  creatorId: string;
  creatorName: string;
  content: string;
  isStreaming?: boolean;
}

// 議論の発言
export interface DiscussionTurn {
  creatorId: string;
  creatorName: string;
  content: string;
  replyTo?: string; // 返信先のcreatorId
  isStreaming?: boolean;
}

// 最終統合案
export interface DiscussionFinal {
  content: string;
  isStreaming?: boolean;
}

export interface Message {
  id: string;
  conversation_id?: string;
  role: "user" | "assistant";
  content: string;
  creators?: string[];
  createdAt: Date;
  creatorSections?: CreatorSection[];
  discussion?: DiscussionTurn[]; // 議論スレッド
  discussionFinal?: DiscussionFinal; // 最終統合案
  canStartDiscussion?: boolean; // 議論開始可能フラグ
  videoList?: VideoItem[]; // アカウント分析時の動画一覧
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  creators?: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
}

export interface InsightData {
  url: string;
  platform: "TikTok" | "YouTube" | "Instagram" | "X";
  view: number | null;
  like: number | null;
  comment: number | null;
  share: number | null;
  save: number | null;
  durationSec: number | null;
  thumbnail?: string;
}

export interface AnalysisResult {
  narration: string;
  telop: string;
  cutCount: number;
  hookContent: string;
  compositionPlan: string;
  secPerCut: number;
}

export interface VideoAnalysisResult {
  videoId: string;
  videoUrl: string;
  desc: string;
  stats: {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  };
  analysis: string | null;
  error?: string;
}

// フィードバックデータ
export interface FeedbackData {
  id?: string;
  messageId: string;
  creators: string[];
  rating: number | null; // 1-5, null = 未評価
  comment: string | null; // 自由記載, null = なし
  messageContent?: string;
  messageType: "chat" | "analysis";
  createdAt?: Date;
}

// アカウント分析用：動画アイテム
export interface VideoItem {
  id: string;
  url: string;
  desc: string;
  thumbnail: string | null;
  createdAt: number;
  stats: {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
  };
  metrics: {
    lvr: number;
    cvr: number;
    svr: number;
    saveRate: number;
    er: number;
  };
  analysis: string | null;
  error?: string;
}
