'use client'

import { Message } from '@/lib/types'
import { MessageItem } from './MessageItem'
import type { ProgressStep } from './AnalysisProgress'

interface MessageListProps {
  messages: Message[]
  onRegenerate?: () => void
  onEdit?: (messageId: string, newContent: string) => void
  onStartDiscussion?: (messageId: string) => void
  isLoading?: boolean
  loadingStage?: string | null
  loadingPercent?: number | null
  loadingSteps?: ProgressStep[] | null
}

export function MessageList({ messages, onRegenerate, onEdit, onStartDiscussion, isLoading, loadingStage, loadingPercent, loadingSteps }: MessageListProps) {
  return (
    <div className="flex flex-col">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          isLoading={isLoading}
          loadingStage={loadingStage}
          loadingPercent={loadingPercent}
          loadingSteps={loadingSteps}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
          onStartDiscussion={onStartDiscussion}
        />
      ))}
    </div>
  )
}
