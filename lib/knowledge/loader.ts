// SNSアカウント情報
export interface SocialAccounts {
  threads?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  instagram?: string
  note?: string
}

// Creator情報の型定義
export interface CreatorInfo {
  id: string
  name: string
  description: string
  dataCount: number
  imageUrl?: string
  accounts?: SocialAccounts
}

// 利用可能なcreator一覧
export const AVAILABLE_CREATORS: CreatorInfo[] = [
  {
    id: 'doshirouto',
    name: 'ど素人ホテル',
    description: '片岡力也 - 稀有度×プロセスエコノミー',
    dataCount: 4,
    accounts: { threads: '4610_hotel', twitter: '4610_hotel' }
  },
  {
    id: 'galileo',
    name: 'ガリレオ',
    description: '前薗孝彰 - アルゴリズム×構成術',
    dataCount: 0,
    accounts: { twitter: 'galileo_tiktok', tiktok: 'galileotiktok' }
  },
  {
    id: 'matsudake',
    name: 'マツダ家の日常',
    description: '関ミナティ - リサーチ×ブランド化',
    dataCount: 15,
    accounts: { tiktok: 'matsudafamily', youtube: 'UCKrIPBpUuS0xFYgL_3LMPGw', instagram: 'matsudafamily' }
  },
  {
    id: 'yukos',
    name: 'ゆうこす',
    description: '菅本裕子 - 共感SNS×モテクリエイター',
    dataCount: 16,
    accounts: { twitter: 'yukos_kawaii', tiktok: 'yukos0520', instagram: 'yukos0520', note: 'yukosnote' }
  },
  {
    id: 'satoyu',
    name: 'SATOYU',
    description: 'OHIOBOSS - グローバル×ミーム文化',
    dataCount: 0,
    accounts: { twitter: 'satoyu0704', tiktok: 'satoyu727', instagram: 'satoyuohioboss' }
  },
  {
    id: 'kagei',
    name: '景井ひな',
    description: 'TikTokクリエイター - 爆発的成長×親しみやすさ',
    dataCount: 0,
    accounts: { twitter: 'hinatter0219', tiktok: 'kageihina', instagram: 'kagei_hina' }
  },
  {
    id: 'gokkoclub',
    name: 'ごっこ倶楽部',
    description: '縦型ショートドラマ - ストーリー×感情',
    dataCount: 15,
    accounts: { twitter: 'gokko5club', tiktok: 'gokko5club', youtube: 'UChbyqrxREoPtmUmYaxUAGqA', instagram: 'gokko5club' }
  },
]

// CreatorIdからCreatorInfoを取得
export function getCreatorById(id: string): CreatorInfo | undefined {
  return AVAILABLE_CREATORS.find(c => c.id === id)
}

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

  yukos: `## ゆうこす（菅本裕子）の核心
- **共感SNSの構築**: 1冊の本のようにSNSを作り上げる
- **モテクリエイター**: 自己プロデュースで独自ポジション確立
- **フォロワーからファンへ**: バズるだけでなくファン化が重要
- **321ライバー事務所**: 年間売上20億、所属3000人超、入りたい事務所No.1
- **事業家視点**: 「なぜやるか」を明確にし、チームで成長する
- **200万人フォロワー**: 複数プラットフォームで影響力構築`,

  satoyu: `## SATOYU OHIOBOSS の核心
- **グローバルコンテンツ**: 言語に依存しないビジュアル中心
- **ミーム文化との親和性**: 「Ohio Final Boss」で海外バズ
- **TikTok LIVE活用**: ファンとの距離感を縮める
- **アニメ・ゲームテーマ**: 親しみやすいコンテンツ
- **1060万フォロワー**: Creator of the Year 2024受賞`,

  kagei: `## 景井ひな の核心
- **爆発的初動**: 開始10日でフォロワー10万人
- **9ヶ月で100万人**: 本格活動後の急成長
- **親しみやすさ**: ダンス・リップシンクで共感獲得
- **女優・モデル展開**: TikTokからマルチタレントへ
- **1030万フォロワー**: 女性国内SNSフォロワー数2位`,

  gokkoclub: `## ごっこ倶楽部 の核心
- **縦型ショートドラマ**: 1-3分で完結するストーリー
- **レコメンド時代への対応**: アルゴリズム最適化
- **5人のクリエイター集団**: 監督・脚本・俳優の複合チーム
- **感情を動かす**: 驚き・共感・笑い・感動の仕掛け
- **180万フォロワー**: TikTok上半期トレンド大賞2024`,
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
