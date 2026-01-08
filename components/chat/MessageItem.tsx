'use client'

import ReactMarkdown from 'react-markdown'
import { Message, CreatorSection } from '@/lib/types'

interface MessageItemProps {
  message: Message
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-bold mt-3 mb-1">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="ml-2">{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-gray-200">{children}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 my-3 text-gray-200 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm text-sky-300">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-gray-800 p-3 rounded-lg my-3 overflow-x-auto">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-gray-600 my-4" />,
}

function CreatorSectionView({ section, isFirst }: { section: CreatorSection; isFirst: boolean }) {
  return (
    <div className={!isFirst ? 'mt-6 pt-6 border-t border-gray-600' : ''}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-medium">
          {section.creatorName.charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-emerald-400">{section.creatorName} の視点</h3>
        {section.isStreaming && (
          <div className="flex items-center gap-1 ml-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-emerald-400 text-xs">分析中</span>
          </div>
        )}
      </div>
      <div className="text-white leading-relaxed">
        {section.content ? (
          <ReactMarkdown components={markdownComponents}>
            {section.content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-sm">分析を準備中...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const hasMultipleSections = message.creatorSections && message.creatorSections.length > 1

  return (
    <div className={`py-6 ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'}`}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 flex gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-sm flex items-center justify-center text-white text-sm font-medium shrink-0 ${
            isUser ? 'bg-purple-600' : 'bg-emerald-600'
          }`}
        >
          {isUser ? 'U' : 'BT'}
        </div>

        {/* Content */}
        <div className="flex-1 text-white leading-relaxed">
          {hasMultipleSections ? (
            <div>
              {message.creatorSections!.map((section, index) => (
                <CreatorSectionView
                  key={section.creatorId}
                  section={section}
                  isFirst={index === 0}
                />
              ))}
            </div>
          ) : message.content ? (
            isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <ReactMarkdown components={markdownComponents}>
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
