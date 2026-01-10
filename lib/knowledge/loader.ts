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
  // 実績情報
  followers?: string         // フォロワー数
  achievements?: string[]    // 受賞歴
  works?: string[]           // 代表作・バズ動画
  career?: string[]          // 経歴・著書
}

// 利用可能なcreator一覧
export const AVAILABLE_CREATORS: CreatorInfo[] = [
  {
    id: 'doshirouto',
    name: 'ど素人ホテル',
    description: '片岡力也 - 稀有度×プロセスエコノミー',
    dataCount: 4,
    accounts: { threads: '4610_hotel', twitter: '4610_hotel' },
    followers: 'Threads 1.8万人',
    achievements: ['「ど素人ホテル再建計画」シリーズでバズ'],
    works: ['ホテル再建ドキュメンタリー', '経営×SNSコンテンツ'],
    career: ['元広告代理店勤務', 'ホテルオーナー兼インフルエンサー'],
  },
  {
    id: 'galileo',
    name: 'ガリレオ',
    description: '前薗孝彰 - アルゴリズム×構成術',
    dataCount: 0,
    accounts: { twitter: 'galileo_tiktok', tiktok: 'galileotiktok' },
    followers: 'TikTok 50万人',
    achievements: ['TikTok運用のプロフェッショナル'],
    works: ['アルゴリズム解説動画', 'ショート動画構成術'],
    career: ['TikTokコンサルタント', 'SNSマーケター'],
  },
  {
    id: 'matsudake',
    name: 'マツダ家の日常',
    description: '関ミナティ - リサーチ×ブランド化',
    dataCount: 15,
    accounts: { tiktok: 'matsudafamily', youtube: 'UCKrIPBpUuS0xFYgL_3LMPGw', instagram: 'matsudafamily' },
    followers: 'TikTok 700万人',
    achievements: ['家族系TikToker日本一'],
    works: ['「パパとギャル」シリーズ', '家族コンテンツ'],
    career: ['元お笑い芸人', '現役TikToker'],
  },
  {
    id: 'yukos',
    name: 'ゆうこす',
    description: '菅本裕子 - 共感SNS×モテクリエイター',
    dataCount: 16,
    accounts: { twitter: 'yukos_kawaii', tiktok: 'yukos0520', instagram: 'yukos0520', note: 'yukosnote' },
    followers: '総フォロワー 200万人',
    achievements: ['入りたいライバー事務所No.1', '321年間売上20億円'],
    works: ['321（サニイチ）ライバー事務所運営', '著書『共感SNS』'],
    career: ['元HKT48', 'モテクリエイター', '実業家'],
  },
  {
    id: 'satoyu',
    name: 'SATOYU',
    description: 'OHIOBOSS - グローバル×ミーム文化',
    dataCount: 0,
    accounts: { twitter: 'satoyu0704', tiktok: 'satoyu727', instagram: 'satoyuohioboss' },
    followers: 'TikTok 1060万人',
    achievements: ['TikTok Creator of the Year 2024', '世界的ミームクリエイター'],
    works: ['Ohio Final Boss', 'グローバルバイラル動画'],
    career: ['TikTok LIVEクリエイター'],
  },
  {
    id: 'kagei',
    name: '景井ひな',
    description: 'TikTokクリエイター - 爆発的成長×親しみやすさ',
    dataCount: 0,
    accounts: { twitter: 'hinatter0219', tiktok: 'kageihina', instagram: 'kagei_hina' },
    followers: 'TikTok 1030万人',
    achievements: ['女性国内SNSフォロワー数2位', '開始10日で10万人達成', '9ヶ月で100万人突破'],
    works: ['リップシンク動画', 'ダンス動画'],
    career: ['女優', 'モデル', 'TikToker'],
  },
  {
    id: 'gokkoclub',
    name: 'ごっこ倶楽部',
    description: '縦型ショートドラマ - ストーリー×感情',
    dataCount: 15,
    accounts: { twitter: 'gokko5club', tiktok: 'gokko5club', youtube: 'UChbyqrxREoPtmUmYaxUAGqA', instagram: 'gokko5club' },
    followers: 'TikTok 180万人',
    achievements: ['TikTok上半期トレンド大賞2024'],
    works: ['縦型ショートドラマ', '1-3分完結ストーリー'],
    career: ['5人のクリエイター集団', '監督・脚本・俳優'],
  },
  {
    id: 'brendankane',
    name: 'Brendan Kane',
    description: 'Hook Point - 3秒で注目を集める科学',
    dataCount: 0,
    accounts: { twitter: 'BrendanKane', instagram: 'brendankane' },
    followers: '60B+ Views Generated',
    achievements: ['60B+ビュー生成', '100M+フォロワー獲得', '$1B+クライアント収益'],
    works: ['One Million Followers', 'Hook Point', 'The Guide to Going Viral'],
    career: ['Hook Point創設者', 'Taylor Swift/Rihanaデジタル戦略', 'MTV/IKEA/Skechersコンサル'],
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

  brendankane: `## Brendan Kane（Hook Point）の核心
- **3秒ルール**: 人は3秒以内にコンテンツを見るか決める
- **パターンインタラプト**: 予想を裏切ることで注意を引く（例: 「瞑想は詐欺」）
- **Hook + Story + Authenticity**: 3本柱のバランスが成功の鍵
- **仮説→テスト→ピボット**: 科学的アプローチで再現可能なバイラルを生む
- **80/20ルール**: 80%は価値提供、20%はCTA
- **220+バイラルフォーマット**: 実証済みの型から選択
- **Process Communication Model**: 視聴者を6タイプに分類（Thinkers/Persisters/Harmonizers/Imaginers/Rebels/Promoters）`,
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
