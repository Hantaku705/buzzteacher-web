// SNSアカウント情報
export interface SocialAccounts {
  threads?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  instagram?: string;
  note?: string;
}

// Creator情報の型定義
export interface CreatorInfo {
  id: string;
  name: string;
  description: string;
  dataCount: number;
  imageUrl?: string;
  accounts?: SocialAccounts;
  // 実績情報
  followers?: string; // フォロワー数
  achievements?: string[]; // 受賞歴
  works?: string[]; // 代表作・バズ動画
  career?: string[]; // 経歴・著書
}

// 利用可能なcreator一覧
export const AVAILABLE_CREATORS: CreatorInfo[] = [
  {
    id: "ai",
    name: "AI統合審査員",
    description: "3メソッド統合 - ど素人×Hook Point×ごっこ倶楽部",
    dataCount: 8,
    followers: "3メソッド統合",
    achievements: ["ど素人ホテル・Hook Point・ごっこ倶楽部を統合"],
    works: ["統合フレームワーク", "横断的メソッド分析"],
    career: ["AI統合ナレッジ", "バズ動画プロフェッショナルBot"],
  },
  {
    id: "doshirouto",
    name: "ど素人ホテル",
    description: "片岡力也 - 稀有度×プロセスエコノミー",
    dataCount: 4,
    accounts: { threads: "4610_hotel", twitter: "4610_hotel" },
    followers: "Threads 1.8万人",
    achievements: ["「ど素人ホテル再建計画」シリーズでバズ"],
    works: ["ホテル再建ドキュメンタリー", "経営×SNSコンテンツ"],
    career: ["元広告代理店勤務", "ホテルオーナー兼インフルエンサー"],
  },
  {
    id: "galileo",
    name: "ガリレオ",
    description: "前薗孝彰 - アルゴリズム×構成術",
    dataCount: 0,
    accounts: { twitter: "galileo_tiktok", tiktok: "galileotiktok" },
    followers: "TikTok 50万人",
    achievements: ["TikTok運用のプロフェッショナル"],
    works: ["アルゴリズム解説動画", "ショート動画構成術"],
    career: ["TikTokコンサルタント", "SNSマーケター"],
  },
  {
    id: "matsudake",
    name: "マツダ家の日常",
    description: "関ミナティ - リサーチ×ブランド化",
    dataCount: 15,
    accounts: {
      tiktok: "matsudafamily",
      youtube: "UCKrIPBpUuS0xFYgL_3LMPGw",
      instagram: "matsudafamily",
    },
    followers: "TikTok 700万人",
    achievements: ["家族系TikToker日本一"],
    works: ["「パパとギャル」シリーズ", "家族コンテンツ"],
    career: ["元お笑い芸人", "現役TikToker"],
  },
  {
    id: "yukos",
    name: "ゆうこす",
    description: "菅本裕子 - 共感SNS×モテクリエイター",
    dataCount: 16,
    accounts: {
      twitter: "yukos_kawaii",
      tiktok: "yukos0520",
      instagram: "yukos0520",
      note: "yukosnote",
    },
    followers: "総フォロワー 200万人",
    achievements: ["入りたいライバー事務所No.1", "321年間売上20億円"],
    works: ["321（サニイチ）ライバー事務所運営", "著書『共感SNS』"],
    career: ["元HKT48", "モテクリエイター", "実業家"],
  },
  {
    id: "satoyu",
    name: "SATOYU",
    description: "OHIOBOSS - グローバル×ミーム文化",
    dataCount: 0,
    accounts: {
      twitter: "satoyu0704",
      tiktok: "satoyu727",
      instagram: "satoyuohioboss",
    },
    followers: "TikTok 1060万人",
    achievements: [
      "TikTok Creator of the Year 2024",
      "世界的ミームクリエイター",
    ],
    works: ["Ohio Final Boss", "グローバルバイラル動画"],
    career: ["TikTok LIVEクリエイター"],
  },
  {
    id: "kagei",
    name: "景井ひな",
    description: "TikTokクリエイター - 爆発的成長×親しみやすさ",
    dataCount: 0,
    accounts: {
      twitter: "hinatter0219",
      tiktok: "kageihina",
      instagram: "kagei_hina",
    },
    followers: "TikTok 1030万人",
    achievements: [
      "女性国内SNSフォロワー数2位",
      "開始10日で10万人達成",
      "9ヶ月で100万人突破",
    ],
    works: ["リップシンク動画", "ダンス動画"],
    career: ["女優", "モデル", "TikToker"],
  },
  {
    id: "gokkoclub",
    name: "ごっこ倶楽部",
    description: "縦型ショートドラマ - ストーリー×感情",
    dataCount: 15,
    accounts: {
      twitter: "gokko5club",
      tiktok: "gokko5club",
      youtube: "UChbyqrxREoPtmUmYaxUAGqA",
      instagram: "gokko5club",
    },
    followers: "TikTok 180万人",
    achievements: ["TikTok上半期トレンド大賞2024"],
    works: ["縦型ショートドラマ", "1-3分完結ストーリー"],
    career: ["5人のクリエイター集団", "監督・脚本・俳優"],
  },
  {
    id: "brendankane",
    name: "Brendan Kane",
    description: "Hook Point - 3秒で注目を集める科学",
    dataCount: 0,
    accounts: { twitter: "BrendanKane", instagram: "brendankane" },
    followers: "60B+ Views Generated",
    achievements: [
      "60B+ビュー生成",
      "100M+フォロワー獲得",
      "$1B+クライアント収益",
    ],
    works: ["One Million Followers", "Hook Point", "The Guide to Going Viral"],
    career: [
      "Hook Point創設者",
      "Taylor Swift/Rihanaデジタル戦略",
      "MTV/IKEA/Skechersコンサル",
    ],
  },
];

// CreatorIdからCreatorInfoを取得
export function getCreatorById(id: string): CreatorInfo | undefined {
  return AVAILABLE_CREATORS.find((c) => c.id === id);
}

// creator別のサマリー定義
const CREATOR_SUMMARIES: Record<string, string> = {
  ai: `## AI統合審査員 の核心
- **3メソッド統合**: ど素人ホテル・Hook Point・ごっこ倶楽部の知見を横断活用
- **2-3秒ルール**: 最初の数秒で勝負が決まる（3メソッド共通）
- **稀有度×科学×感情**: 差別化の三位一体アプローチ
- **仮説→テスト→ピボット**: 科学的にバイラルを生む
- **価値提供 + エンゲージメント**: 「見て終わり」ではなく「関わりたい」
- **データで判断し高速で回す**: 完璧より量産、感覚より数値`,

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
};

// Creator別の成功・失敗事例
const CREATOR_CASES: Record<string, string> = {
  ai: `## 成功事例（3メソッド統合）

### Case 1: 重度障がい者の嫁（2166万再生）
- **構成**: 稀有な人×普通の質問
- **成功要因**: 稀有度の高さ、質問のシンプルさ、感情の着地点（愛）
- **学べる技法**: 「○○の嫁/夫」×「なぜ選んだ？」の掛け合わせ

### Case 2: ストリートラーメン（287万再生）
- **構成**: ストリート×知的欲求連鎖6段階
- **成功要因**: 疑問が解決すると次の疑問が生まれる、緊張感、覗き見欲
- **学べる技法**: 6段階の知的欲求連鎖（何？→誰？→なぜ？→どう？→結果→感想）

### Case 3: ど素人ホテル再建（1週間2万フォロワー）
- **構成**: プロセスエコノミー×視聴者参加
- **成功要因**: 正しい弱者設定、リアルタイム性、失敗もコンテンツ
- **学べる技法**: 視聴者を当事者にする（投票、募集、参加）

### Case 4: JAL×ごっこ倶楽部（1ヶ月1000万再生）
- **構成**: 感情エンジニアリング×企業タイアップ
- **成功要因**: 体験の疑似化、文脈の共有
- **学べる技法**: 機能的価値→感情的体験への翻訳

## 失敗パターン
| パターン | 原因 | 教訓 |
|----------|------|------|
| モザイク全体がけ | 見えないものに長時間付き合う気力がない | 「チラ見せ」程度が効果的 |
| 冒頭に間がある | 0.5秒で「価値がなさそう」と判断 | 冒頭0.5秒すら無駄にしない |
| 弱者設定のベクトル違い | 弱者属性と目標が無関係 | 弱者属性は目標に関連必要 |
| フックなし良コンテンツ | 内容は良いが埋もれる | 最初の3秒に全力 |`,

  doshirouto: `## 成功事例（ど素人ホテル）

### Case 1: 重度障がい者の嫁（2166万再生）
- **構成**: 稀有な人×普通の質問
- **学べる技法**: 稀有度の掛け合わせ（関係性の稀有さ×タブー性×共感可能性）

### Case 2: ストリートラーメン（287万再生）
- **構成**: ストリート×知的欲求連鎖
- **学べる技法**: 疑問を6段階で連鎖させる
  1. 「ストリートラーメンって何？」
  2. 声をかけられた人のリアクション
  3. 「なぜ家に招き入れるの？」
  4. 冷蔵庫の中身への覗き見欲
  5. 限られた食材でどう調理するか
  6. 食べた瞬間のリアクション

### Case 3: 笑わなかったら無料の焼肉屋（113万再生）
- **構成**: UGC生成型
- **学べる技法**: 「撮りたくなる体験」を設計する

## 失敗パターン
- **弱者設定のベクトル違い**: 「身長140cm×ホテル再建」は関係ない→「ど素人×ホテル再建」は関係ある`,

  brendankane: `## 成功事例（Hook Point）

### Case 1: 30日で100万フォロワー
- **成功要因**: 科学的アプローチ（仮説→テスト→ピボット）、大量テスト
- **学べる技法**: データドリブンな高速PDCA

### Case 2: Fortune 500クライアント
- **成果**: 60B+ビュー、$1B+収益
- **学べる技法**: パターンインタラプト、220+フォーマットの活用

## 失敗パターン
| パターン | 症状 | 対策 |
|----------|------|------|
| 価値なしフック | 一時的バズ→信頼失墜 | 約束した価値を必ず提供 |
| テストなし繰り返し | 成長停滞 | 仮説→テスト→ピボット徹底 |`,

  gokkoclub: `## 成功事例（ごっこ倶楽部）

### Case 1: JAL（1ヶ月1000万再生）
- **成果**: フォロワー1日9000人増、久米島路線予約400%増
- **学べる技法**: 体験の疑似化、文脈の共有

### Case 2: パーソルHD（3ヶ月10万フォロワー）
- **成果**: 総再生4000万、コスト効率 既存TV施策の140倍
- **学べる技法**: シリーズ化による習慣形成

## 人気動画分析
| 動画 | 再生数 | いいね率 | 特徴 |
|------|--------|----------|------|
| 家族のポイズン 1話 | 660万 | 2.08% | 最高パフォーマンス |
| 彼女はいつも遅れてきて 2話 | 210万 | 4.34% | 感動テーマの訴求力 |`,
};

// Creator別の技法集
const CREATOR_TECHNIQUES: Record<string, string> = {
  ai: `## 技法集（3メソッド統合）

### パワーワード
| カテゴリ | 例 |
|----------|-----|
| ネガティブ系 | 大赤字、借金、ど素人、いきなり、失敗 |
| ポジティブ系 | 達成、黒字化、逆転、100万再生 |
| 組み合わせ | ネガティブ×ネガティブ = 最強インパクト |

### 自己紹介構文
「僕は [パワーワード] [行動] する [弱者属性]」
例: 「僕はいきなり大赤字ホテルを再建するど素人」

### 知的欲求連鎖（6段階）
1. 「〇〇って何？」→ 2. 「誰が？」→ 3. 「なぜ？」→ 4. 「どうやって？」→ 5. 「結果は？」→ 6. 「どう感じた？」

### パターンインタラプト
| 常識 | パターンインタラプト |
|------|----------------------|
| 「努力は大事」 | 「努力は無駄」 |
| 「瞑想は良い」 | 「瞑想は詐欺」 |
→ 否定の後に真実を用意

### Hook-Grip-Push（ごっこ倶楽部）
- [0-2秒] Hook: 注意を掴む
- [5秒付近] Grip: さらに惹きつける
- [15秒付近] Push: 最後まで見せ切る

### コメント誘導
- **直接誘導**: 「どっちがいい？1か2で」「〇〇な人はコメント」
- **質問形式**: 「あなたならどうする？」「どう思う？」
- **予告型**: 「続きはフォローして待ってて」`,

  doshirouto: `## 技法集（ど素人ホテル）

### パワーワード
| カテゴリ | 例 |
|----------|-----|
| 金銭 | 大赤字、借金、破産、0円 |
| 困難 | ど素人、初心者、未経験、ゼロから |
| 緊急 | いきなり、突然、まさかの |

### 自己紹介構文
「僕は [パワーワード] [行動] する [弱者属性]」

### 知的欲求連鎖の作り方
1. 「〇〇って何？」
2. 「誰がやるの？」
3. 「どうやって？」
4. 「上手くいくの？」
5. 「結果は？」
6. 「どう感じた？」

### 誤解→共感→回収
Step 1: 誤解を生む → 「ホテル辞めます」
Step 2: 共感でつなぐ → 「今まで応援いただきましたが...」
Step 3: 回収で納得 → 「辞めるのは今日だけです」`,

  brendankane: `## 技法集（Hook Point）

### パターンインタラプト
| 常識 | パターンインタラプト |
|------|----------------------|
| 「成功の秘訣は努力」 | 「努力は無駄」 |
| 「瞑想は良い」 | 「瞑想は詐欺」 |

### 感情トリガー
| 感情 | トリガーワード |
|------|----------------|
| 驚き | 「まさか」「信じられない」 |
| 好奇心 | 「秘密」「裏側」「誰も言わない」 |
| 恐怖 | 「危険」「知らないと損」 |

### 高速A/Bテスト
1. 仮説を立てる
2. 1つの要素だけ変える
3. 同時に公開
4. 24-48時間でデータ確認

### データ分析の型
| 指標 | 目標 |
|------|------|
| 視聴維持率（3秒） | 70%以上 |
| 平均視聴時間 | 50%以上 |
| シェア率 | 1%以上 |`,

  gokkoclub: `## 技法集（ごっこ倶楽部）

### Hook-Grip-Push
- [0-2秒] Hook: 冒頭からビンタされる修羅場など
- [5秒付近] Grip: さらに惹きつける
- [15秒付近] Push: 最後まで見せ切る

### 縦型フォーマット演出
| 要素 | 縦型ショートドラマ |
|------|-------------------|
| 画面構成 | 顔への極端なクロースアップ |
| カット割り | ハイテンポかつリズミカル |
| 音響設計 | スマホスピーカー前提 |

### 20投稿テスト法
Week 1-2: 様々なテクニックを試す（5-7投稿）
Week 3-4: 反応を見ながら調整（8-14投稿）
Week 5-6: パターンを最適化（15-20投稿）

### 改善優先度
🔴 最優先: フック強化、コメント誘導具体化、テロップ活用
🟡 中期: ストーリー構成の多様化`,
};

// 特定creatorのサマリーを取得
export function getCreatorSummary(creatorId: string): string {
  return CREATOR_SUMMARIES[creatorId] || "";
}

// 特定creatorの成功事例を取得
export function getCreatorCases(creatorId: string): string {
  return CREATOR_CASES[creatorId] || CREATOR_CASES["ai"] || "";
}

// 特定creatorの技法集を取得
export function getCreatorTechniques(creatorId: string): string {
  return CREATOR_TECHNIQUES[creatorId] || CREATOR_TECHNIQUES["ai"] || "";
}

// 全creatorのサマリーを取得（既存互換）
export function getKnowledgeSummary(creatorIds?: string[]): string {
  const ids = creatorIds || Object.keys(CREATOR_SUMMARIES);
  const summaries = ids
    .map((id) => CREATOR_SUMMARIES[id])
    .filter(Boolean)
    .join("\n\n---\n\n");

  return `# バズ動画ナレッジサマリー\n\n${summaries}`;
}

// 非推奨: ファイルシステム依存関数（Vercel非対応）
export function loadKnowledge(_creator: string): string {
  console.warn("loadKnowledge is deprecated - use getCreatorSummary instead");
  return "";
}

export function loadAllKnowledge(): string {
  console.warn(
    "loadAllKnowledge is deprecated - use getKnowledgeSummary instead",
  );
  return "";
}
