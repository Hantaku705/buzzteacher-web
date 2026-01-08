// Creator情報の型定義
export interface CreatorInfo {
  id: string
  name: string
  description: string
  dataCount: number
}

// 利用可能なcreator一覧
export const AVAILABLE_CREATORS: CreatorInfo[] = [
  { id: 'doshirouto', name: 'ど素人ホテル', description: '片岡力也 - 稀有度×プロセスエコノミー', dataCount: 4 },
  { id: 'galileo', name: 'ガリレオ', description: '前薗孝彰 - アルゴリズム×構成術', dataCount: 0 },
  { id: 'matsudake', name: 'マツダ家の日常', description: '関ミナティ - リサーチ×ブランド化', dataCount: 0 },
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

  galileo: `## ガリレオ（前薗孝彰）の核心
- **アルゴリズムの7割は視聴時間**: 平均視聴時間と視聴完了率が最重要
- **冒頭2秒でインパクト**: スワイプを止める強烈なフック
- **3部構成（短尺）**: 冒頭インパクト→本編→終盤インパクト
- **4部構成（長尺）**: 冒頭→興味付け→本編→まとめ
- **テロップ4色以内**: 視認性を確保
- **完全視聴率を上げる**: 最後まで見させる構成が鍵`,

  matsudake: `## マツダ家の日常（関ミナティ）の核心
- **最初の2秒で視覚的ツカミ**: 複雑な説明を避ける
- **自分×視聴者の重合点**: 自分が楽しい×視聴者が求める
- **1日20時間のリサーチ**: 徹底的な分析とPDCA
- **定番フレーズでブランド化**: 覚えやすいキャッチフレーズ
- **コメント欄から個性発見**: 視聴者フィードバック活用
- **トレンドに乗る**: 伸びてる動画を参考にアレンジ`,
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
