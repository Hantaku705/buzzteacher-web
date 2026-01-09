'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Message, CreatorSection } from '@/lib/types'
import { CreatorIcons } from '@/components/shared/CreatorIcons'

interface MessageItemProps {
  message: Message
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      aria-label="コードをコピー"
    >
      {copied ? (
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

function CodeBlock({ children, className }: { children?: React.ReactNode; className?: string }) {
  const codeElement = children as React.ReactElement<{ children?: string; className?: string }>
  const codeString = typeof codeElement?.props?.children === 'string'
    ? codeElement.props.children.replace(/\n$/, '')
    : ''

  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const match = /language-(\w+)/.exec(className || codeElement?.props?.className || '')
  const language = match ? match[1] : ''

  return (
    <div className="relative group my-3">
      {language && (
        <div className="absolute top-0 left-0 px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-tl-lg rounded-br-lg">
          {language}
        </div>
      )}
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        className="!mt-0 !rounded-lg !pr-12"
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          paddingTop: language ? '2rem' : '0.75rem',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
      <CopyButton text={codeString} />
    </div>
  )
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-bold mt-3 mb-1">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-base font-bold mt-2 mb-1">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="pl-1">{children}</li>,
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
  pre: CodeBlock,
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

function ErrorMessage({ content, onRetry }: { content: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-red-300 text-sm">{content}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface MessageItemFullProps extends MessageItemProps {
  onRetry?: () => void
  onRegenerate?: () => void
  onEdit?: (messageId: string, newContent: string) => void
  isLast?: boolean
  isLoading?: boolean
  loadingStage?: string | null
}

export function MessageItem({ message, onRetry, onRegenerate, onEdit, isLast, isLoading, loadingStage }: MessageItemFullProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isUser = message.role === 'user'
  const hasMultipleSections = message.creatorSections && message.creatorSections.length > 1
  const isError = message.content?.startsWith('エラー:')
  const showRegenerate = !isUser && isLast && !isLoading && message.content && !isError
  const showEditButton = isUser && !isLoading

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
    }
  }, [isEditing, editContent])

  const handleEdit = () => {
    setEditContent(message.content)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleSave = () => {
    if (editContent.trim() && editContent !== message.content && onEdit) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={`py-6 animate-fade-in-up ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'}`}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 flex gap-4">
        {/* Avatar */}
        {isUser ? (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-white text-sm font-medium shrink-0 bg-purple-600">
            U
          </div>
        ) : isError ? (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-white text-sm font-medium shrink-0 bg-red-600">
            !
          </div>
        ) : message.creators && message.creators.length > 0 ? (
          <CreatorIcons creatorIds={message.creators} size="md" />
        ) : (
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-white text-sm font-medium shrink-0 bg-emerald-600">
            BT
          </div>
        )}

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
              isEditing ? (
                <div className="flex flex-col gap-3 w-full">
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-[#40414f] text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-600"
                    rows={1}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!editContent.trim() || editContent === message.content}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      保存して送信
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {showEditButton && (
                    <button
                      onClick={handleEdit}
                      className="absolute -right-8 top-0 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                      aria-label="メッセージを編集"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )
            ) : isError ? (
              <ErrorMessage content={message.content.replace('エラー: ', '')} onRetry={onRetry} />
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
                <span className="text-emerald-400 text-sm font-medium">
                  {loadingStage || '処理中...'}
                </span>
              </div>
              {!loadingStage && (
                <span className="text-gray-400 text-xs">動画のダウンロードと分析には30秒〜1分ほどかかります</span>
              )}
            </div>
          )}

          {/* Regenerate button */}
          {showRegenerate && onRegenerate && (
            <div className="mt-4 pt-3 border-t border-gray-600">
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="回答を再生成"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
