'use client'

import { Message } from '@/lib/types'

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`py-6 ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-sm flex items-center justify-center text-white text-sm font-medium shrink-0 ${
            isUser ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        >
          {isUser ? 'U' : 'BT'}
        </div>

        {/* Content */}
        <div className="flex-1 text-gray-100 leading-relaxed whitespace-pre-wrap">
          {message.content || (
            <span className="inline-flex items-center">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
