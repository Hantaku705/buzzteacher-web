import { readFileSync } from 'fs'
import { join } from 'path'

const KNOWLEDGE_DIR = join(process.cwd(), '..', 'project')

export function loadKnowledge(creator: string): string {
  try {
    const filePath = join(KNOWLEDGE_DIR, `creator-${creator}`, 'knowledge', `creator-${creator}.md`)
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load knowledge for ${creator}:`, error)
    return ''
  }
}

export function loadAllKnowledge(): string {
  const creators = ['doshirouto', 'galileo', 'matsudake']
  const knowledges: string[] = []

  for (const creator of creators) {
    const content = loadKnowledge(creator)
    if (content) {
      knowledges.push(`## ${creator}\n\n${content}`)
    }
  }

  return knowledges.join('\n\n---\n\n')
}

export function getKnowledgeSummary(): string {
  return `
# バズ動画ナレッジサマリー

## ど素人ホテル（片岡力也）の核心
- **稀有度が全て**: クオリティより「見たことない」が重要
- **最初の2秒ルール**: 90%が2秒で離脱、パワーワードで始める
- **ワンチャン設定**: 絶対成功でも絶対無理でもない絶妙なバランス
- **プロセスエコノミー**: 今→未来をリアルタイムで描く
- **視聴者参加型**: 投票・コメント・参加要素を入れる

## ガリレオ（前薗孝彰）の核心
- **アルゴリズムの7割は視聴時間**: 平均視聴時間と視聴完了率が最重要
- **冒頭2秒でインパクト**: スワイプを止める強烈なフック
- **3部構成（短尺）**: 冒頭インパクト→本編→終盤インパクト
- **4部構成（長尺）**: 冒頭→興味付け→本編→まとめ
- **テロップ4色以内**: 視認性を確保

## マツダ家の日常（関ミナティ）の核心
- **最初の2秒で視覚的ツカミ**: 複雑な説明を避ける
- **自分×視聴者の重合点**: 自分が楽しい×視聴者が求める
- **1日20時間のリサーチ**: 徹底的な分析とPDCA
- **定番フレーズでブランド化**: 覚えやすいキャッチフレーズ
- **コメント欄から個性発見**: 視聴者フィードバック活用
`
}
