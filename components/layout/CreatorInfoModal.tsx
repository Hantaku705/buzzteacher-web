'use client'

import { AVAILABLE_CREATORS } from '@/lib/knowledge/loader'

interface CreatorInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

function getInitial(name: string): string {
  return name.charAt(0)
}

export function CreatorInfoModal({ isOpen, onClose }: CreatorInfoModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#40414f] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">審査員について</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          BuzzTeacherでは、各審査員の視点から動画を分析・アドバイスします。
          複数の審査員を選択すると、それぞれの専門分野からフィードバックを受けられます。
        </p>

        <div className="space-y-4">
          {AVAILABLE_CREATORS.map((creator) => (
            <div
              key={creator.id}
              className="bg-[#2a2b32] rounded-lg p-4 flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-medium shrink-0">
                {creator.imageUrl ? (
                  <img
                    src={creator.imageUrl}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitial(creator.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{creator.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    creator.dataCount > 0
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-gray-600/20 text-gray-400'
                  }`}>
                    {creator.dataCount > 0 ? `${creator.dataCount}ファイル` : '準備中'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{creator.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
