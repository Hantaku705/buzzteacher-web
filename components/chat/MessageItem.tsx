'use client'

import ReactMarkdown from 'react-markdown'
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
        <div className="flex-1 text-gray-100 leading-relaxed">
          {message.content ? (
            isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mt-3 mb-1">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
                  p: ({ children }) => <p className="mb-3">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-emerald-300">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-emerald-500 pl-4 my-3 text-gray-300 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm text-emerald-300">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-800 p-3 rounded-lg my-3 overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  hr: () => <hr className="border-gray-600 my-4" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">動画を分析中...</span>
              </div>
              <span className="text-gray-500 text-xs">動画のダウンロードと分析には30秒〜1分ほどかかります</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
