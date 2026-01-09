'use client'

import Link from 'next/link'
import { AVAILABLE_CREATORS, getCreatorSummary } from '@/lib/knowledge/loader'

function getSocialUrl(platform: string, username: string): string {
  switch (platform) {
    case 'threads':
      return `https://www.threads.net/@${username}`
    case 'twitter':
      return `https://x.com/${username}`
    case 'tiktok':
      return `https://www.tiktok.com/@${username}`
    case 'youtube':
      return `https://www.youtube.com/channel/${username}`
    case 'instagram':
      return `https://www.instagram.com/${username}`
    case 'note':
      return `https://note.com/${username}`
    default:
      return '#'
  }
}

const platformConfig: Record<string, { label: string; icon: string; color: string }> = {
  threads: { label: 'Threads', icon: '@', color: 'bg-gray-700 hover:bg-gray-600' },
  twitter: { label: 'X', icon: 'X', color: 'bg-black hover:bg-gray-900' },
  tiktok: { label: 'TikTok', icon: 'T', color: 'bg-black hover:bg-gray-900' },
  youtube: { label: 'YouTube', icon: 'Y', color: 'bg-red-600 hover:bg-red-500' },
  instagram: { label: 'Instagram', icon: 'I', color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:opacity-80' },
  note: { label: 'note', icon: 'N', color: 'bg-green-600 hover:bg-green-500' },
}

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-[#343541]">
      {/* Header */}
      <header className="sticky top-0 bg-[#343541]/95 backdrop-blur-sm border-b border-gray-700 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>チャットに戻る</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold text-white">審査員一覧</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-gray-400 text-center mb-8">
          BuzzTeacherの審査員として、それぞれ独自のノウハウで動画をレビューします
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {AVAILABLE_CREATORS.map((creator) => {
            const summary = getCreatorSummary(creator.id)
            const keyPoints = summary
              .replace(/^## .*\n/, '')
              .split('\n')
              .filter(line => line.startsWith('- **'))
              .slice(0, 3)
              .map(line => line.replace(/^- \*\*/, '').replace(/\*\*:.*$/, ''))

            const socialAccounts = creator.accounts
              ? Object.entries(creator.accounts).filter(([, value]) => value)
              : []

            return (
              <div
                key={creator.id}
                className="bg-[#444654] rounded-xl p-6 hover:bg-[#4a4b5a] transition-colors"
              >
                {/* Header with Avatar and Basic Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                    {creator.imageUrl ? (
                      <img
                        src={creator.imageUrl}
                        alt={creator.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      creator.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">{creator.name}</h2>
                      {creator.followers && (
                        <span className="px-2 py-0.5 bg-emerald-600/30 text-emerald-400 text-xs rounded-full font-medium">
                          {creator.followers}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{creator.description}</p>
                  </div>
                </div>

                {/* Achievements */}
                {creator.achievements && creator.achievements.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">受賞・実績</h3>
                    <div className="flex flex-wrap gap-2">
                      {creator.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg"
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Works */}
                {creator.works && creator.works.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">代表作・活動</h3>
                    <div className="flex flex-wrap gap-2">
                      {creator.works.map((work, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg"
                        >
                          {work}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career */}
                {creator.career && creator.career.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">経歴</h3>
                    <div className="flex flex-wrap gap-2">
                      {creator.career.map((item, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-lg"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points from Summary */}
                {keyPoints.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">メソッド</h3>
                    <div className="flex flex-wrap gap-2">
                      {keyPoints.map((point, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs rounded-lg"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {socialAccounts.length > 0 && (
                  <div className="pt-4 border-t border-gray-600">
                    <div className="flex gap-2 flex-wrap">
                      {socialAccounts.map(([platform, username]) => {
                        const config = platformConfig[platform]
                        if (!config) return null
                        return (
                          <a
                            key={platform}
                            href={getSocialUrl(platform, username as string)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${config.color} px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-xs font-medium transition-colors`}
                          >
                            <span className="font-bold">{config.icon}</span>
                            <span>@{username}</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
