// Creator情報の型定義
export interface CreatorInfo {
  id: string
  name: string
  description: string
}

// 利用可能なcreator一覧
export const AVAILABLE_CREATORS: CreatorInfo[] = [
  { id: 'doshirouto', name: 'ど素人ホテル', description: '片岡力也 - 稀有度×プロセスエコノミー' },
]

// creator別のサマリー定義
const CREATOR_SUMMARIES: Record<string, string> = {
  doshirouto: `## ど素人ホテル（片岡力也）の核心
- **稀有度が全て**: クオリティより「見たことない」が重要
- **最初の2秒ルール**: 90%が2秒で離脱、パワーワードで始める
- **ワンチャン設定**: 絶対成功でも絶対無理でもない絶妙なバランス
- **プロセスエコノミー**: 今→未来をリアルタイムで描く
- **視聴者参加型**: 投票・コメント・参加要素を入れる
- **フック例**: 「大赤字」「ど素人が」「〇〇万円」など数字・危機感ワード`,
}

// 特定creatorのサマリーを取得
export function getCreatorSummary(creatorId: string): string {
  return CREATOR_SUMMARIES[creatorId] || ''
}

// 全creatorのサマリーを取得（既存互換）
export function getKnowledgeSummary(creatorIds?: string[]): string {
  const ids = creatorIds || Object.keys(CREATOR_SUMMARIES)
  const summaries = ids
    .map(id => CREATOR_SUMMARIES[id])
    .filter(Boolean)
    .join('\n\n---\n\n')

  return `# バズ動画ナレッジサマリー\n\n${summaries}`
}

// 非推奨: ファイルシステム依存関数（Vercel非対応）
export function loadKnowledge(_creator: string): string {
  console.warn('loadKnowledge is deprecated - use getCreatorSummary instead')
  return ''
}

export function loadAllKnowledge(): string {
  console.warn('loadAllKnowledge is deprecated - use getKnowledgeSummary instead')
  return ''
}
