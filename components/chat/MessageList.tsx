'use client'

import { Message } from '@/lib/types'
import { MessageItem } from './MessageItem'

interface MessageListProps {
  messages: Message[]
  onRegenerate?: () => void
  onEdit?: (messageId: string, newContent: string) => void
  isLoading?: boolean
  loadingStage?: string | null
  loadingPercent?: number | null
}

export function MessageList({ messages, onRegenerate, onEdit, isLoading, loadingStage, loadingPercent }: MessageListProps) {
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
          onRegenerate={onRegenerate}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
