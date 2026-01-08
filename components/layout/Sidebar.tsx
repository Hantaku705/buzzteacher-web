'use client'

import { useState } from 'react'
import { Conversation, User } from '@/lib/types'
import { ConversationList } from './ConversationList'
import { UserProfile } from './UserProfile'

interface SidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  user: User | null
  onLogout: () => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  user,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-[260px] bg-[#202123] flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-600 hover:bg-[#2a2b32] transition-colors text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#202123]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span className="text-sm">新しいチャット</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-2 pb-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="チャットを検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a2b32] text-white text-sm pl-9 pr-3 py-2 rounded-lg border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={filteredConversations}
            currentConversationId={currentConversationId}
            onSelect={(id) => {
              onSelectConversation(id)
              onClose()
            }}
            onDelete={onDeleteConversation}
          />
        </div>

        {/* User Profile */}
        <UserProfile user={user} onLogout={onLogout} />
      </aside>
    </>
  )
}
