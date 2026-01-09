'use client'

import { useEffect } from 'react'
import { CreatorInfo, getCreatorSummary } from '@/lib/knowledge/loader'

interface CreatorDetailModalProps {
  creator: CreatorInfo
  onClose: () => void
}

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

const platformIcons: Record<string, { icon: string; color: string }> = {
  threads: { icon: '@', color: 'bg-gray-700' },
  twitter: { icon: 'X', color: 'bg-black' },
  tiktok: { icon: 'T', color: 'bg-black' },
  youtube: { icon: 'Y', color: 'bg-red-600' },
  instagram: { icon: 'I', color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  note: { icon: 'N', color: 'bg-green-600' },
}

export function CreatorDetailModal({ creator, onClose }: CreatorDetailModalProps) {
  const summary = getCreatorSummary(creator.id)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const socialAccounts = creator.accounts
    ? Object.entries(creator.accounts).filter(([, value]) => value)
    : []

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#2a2b32] rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
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
              <h2 className="text-xl font-bold text-white">{creator.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{creator.description}</p>
              {creator.dataCount > 0 && (
                <p className="text-emerald-400 text-xs mt-2">
                  データ: {creator.dataCount}件
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
              aria-label="閉じる"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SNS Links */}
          {socialAccounts.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {socialAccounts.map(([platform, username]) => {
                const { icon, color } = platformIcons[platform] || { icon: '?', color: 'bg-gray-600' }
                return (
                  <a
                    key={platform}
                    href={getSocialUrl(platform, username as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${color} w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity`}
                    title={`${platform}: @${username}`}
                  >
                    {icon}
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {summary.replace(/^## .*\n/, '').replace(/- \*\*/g, '\n- **')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <a
            href="/creators"
            className="px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            全審査員を見る →
          </a>
        </div>
      </div>
    </div>
  )
}
