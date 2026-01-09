'use client'

import { useState } from 'react'
import { Conversation } from '@/lib/types'
import { AVAILABLE_CREATORS } from '@/lib/knowledge/loader'

function getInitial(name: string): string {
  return name.charAt(0)
}

function CreatorIcons({ creatorIds }: { creatorIds: string[] }) {
  const creators = creatorIds
    .map(id => AVAILABLE_CREATORS.find(c => c.id === id))
    .filter(Boolean)
    .slice(0, 3)

  const extraCount = creatorIds.length - 3

  if (creators.length === 0) {
    // デフォルト: ど素人ホテル
    const defaultCreator = AVAILABLE_CREATORS[0]
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-medium shrink-0">
        {getInitial(defaultCreator.name)}
      </div>
    )
  }

  return (
    <div className="relative flex items-center shrink-0" style={{ width: `${20 + (creators.length - 1) * 10}px`, height: '20px' }}>
      {creators.map((creator, index) => (
        <div
          key={creator!.id}
          className="absolute w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-medium border border-[#202123]"
          style={{
            left: `${index * 10}px`,
            zIndex: 3 - index,
          }}
          title={creator!.name}
        >
          {creator!.imageUrl ? (
            <img
              src={creator!.imageUrl}
              alt={creator!.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitial(creator!.name)
          )}
        </div>
      ))}
      {extraCount > 0 && (
        <div
          className="absolute w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-medium border border-[#202123]"
          style={{
            left: `${creators.length * 10}px`,
            zIndex: 0,
          }}
        >
          +{extraCount}
        </div>
      )}
    </div>
  )
}

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)
  const monthAgo = new Date(today.getTime() - 30 * 86400000)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: '今日', items: [] },
    { label: '昨日', items: [] },
    { label: '過去7日間', items: [] },
    { label: '過去30日間', items: [] },
    { label: 'それ以前', items: [] },
  ]

  conversations.forEach((conv) => {
    const date = new Date(conv.updated_at)
    if (date >= today) {
      groups[0].items.push(conv)
    } else if (date >= yesterday) {
      groups[1].items.push(conv)
    } else if (date >= weekAgo) {
      groups[2].items.push(conv)
    } else if (date >= monthAgo) {
      groups[3].items.push(conv)
    } else {
      groups[4].items.push(conv)
    }
  })

  return groups.filter((g) => g.items.length > 0)
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const groups = groupByDate(conversations)

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        チャット履歴がありません
      </div>
    )
  }

  return (
    <div className="px-2">
      {groups.map((group) => (
        <div key={group.label} className="mb-4">
          <div className="px-3 py-2 text-xs text-gray-400 font-medium">
            {group.label}
          </div>
          {group.items.map((conv) => (
            <div
              key={conv.id}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                ${
                  currentConversationId === conv.id
                    ? 'bg-[#343541]'
                    : 'hover:bg-[#2a2b32]'
                }
              `}
              onClick={() => onSelect(conv.id)}
            >
              <CreatorIcons creatorIds={conv.creators || ['doshirouto']} />
              <span className="text-sm text-white truncate flex-1">
                {conv.title}
              </span>

              {/* Menu button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpenId(menuOpenId === conv.id ? null : conv.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#40414f] rounded transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="メニューを開く"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpenId === conv.id && (
                <div className="absolute right-0 top-full mt-1 bg-[#2a2b32] rounded-lg shadow-lg border border-gray-600 py-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.id)
                      setMenuOpenId(null)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#40414f] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    削除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
