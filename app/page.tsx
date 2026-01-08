'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList } from '@/components/chat/MessageList'
import { CreatorSelector } from '@/components/chat/CreatorSelector'
import { Message } from '@/lib/types'
import { AVAILABLE_CREATORS } from '@/lib/knowledge/loader'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          creator: selectedCreator,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE format
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content || ''
              if (content) {
                fullContent += content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: fullContent } : m
                  )
                )
              }
            } catch {
              // Not JSON, might be plain text
              fullContent += data
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId ? { ...m, content: fullContent } : m
                )
              )
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: 'エラーが発生しました。もう一度お試しください。' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCreatorInfo = selectedCreator
    ? AVAILABLE_CREATORS.find(c => c.id === selectedCreator)
    : null

  return (
    <div className="flex flex-col h-screen bg-[#343541]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h1 className="text-lg font-semibold text-white">BuzzTeacher</h1>
        <CreatorSelector
          selectedCreator={selectedCreator}
          onSelect={setSelectedCreator}
        />
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold text-white mb-2">BuzzTeacher</h2>
            <p className="text-center max-w-md mb-4">
              動画URLを送信すると、バズのプロが分析・アドバイスします。
              <br />
              TikTok, Instagram, YouTube, X に対応しています。
            </p>
            {selectedCreatorInfo && (
              <p className="text-emerald-400 text-sm">
                「{selectedCreatorInfo.name}」の視点でアドバイスします
              </p>
            )}
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
