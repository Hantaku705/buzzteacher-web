'use client'

import { useState, useRef, useEffect } from 'react'
import { AVAILABLE_CREATORS } from '@/lib/knowledge/loader'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  selectedCreators: string[]
  onSelectCreators: (ids: string[]) => void
}

export function ChatInput({ onSend, isLoading, selectedCreators, onSelectCreators }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleCreator = (id: string) => {
    if (selectedCreators.includes(id)) {
      onSelectCreators(selectedCreators.filter(c => c !== id))
    } else {
      onSelectCreators([...selectedCreators, id])
    }
  }

  const toggleAll = () => {
    if (selectedCreators.length === AVAILABLE_CREATORS.length) {
      onSelectCreators([AVAILABLE_CREATORS[0].id])
    } else {
      onSelectCreators(AVAILABLE_CREATORS.map(c => c.id))
    }
  }

  const isAllSelected = selectedCreators.length === AVAILABLE_CREATORS.length

  const getSelectedNames = () => {
    if (selectedCreators.length === 0) return null
    if (selectedCreators.length === AVAILABLE_CREATORS.length) return '全員'
    if (selectedCreators.length === 1) {
      return AVAILABLE_CREATORS.find(c => c.id === selectedCreators[0])?.name
    }
    return `${selectedCreators.length}人選択中`
  }

  return (
    <div className="border-t border-gray-700 bg-[#343541] p-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto relative"
      >
        <div className="relative flex items-end bg-[#40414f] rounded-xl border border-gray-600 shadow-lg focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#40414f] rounded ${
                selectedCreators.length > 0
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-gray-400 hover:text-white'
              }`}
              title={selectedCreators.length > 0 ? `審査: ${getSelectedNames()}` : '審査する人を選択'}
              aria-label="審査する人を選択"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#2f2f2f] rounded-lg shadow-xl border border-gray-600 py-2 z-50">
                <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-600">
                  審査する人を選択（複数可）
                </div>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[#3f3f3f] transition-colors text-white border-b border-gray-700"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isAllSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                  }`}>
                    {isAllSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">全員選択</span>
                </button>

                {AVAILABLE_CREATORS.map((creator) => {
                  const isSelected = selectedCreators.includes(creator.id)
                  return (
                    <button
                      key={creator.id}
                      type="button"
                      onClick={() => toggleCreator(creator.id)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center gap-3 hover:bg-[#3f3f3f] transition-colors text-white"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{creator.name}</span>
                          <span className={`text-xs flex-shrink-0 ${
                            creator.dataCount > 0 ? 'text-emerald-400' : 'text-gray-500'
                          }`}>
                            {creator.dataCount > 0 ? `${creator.dataCount}ファイル` : '準備中'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{creator.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="動画URLを入力してください（TikTok, Instagram, YouTube, X）"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none py-3 px-2 pr-12 focus:outline-none max-h-[200px]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            aria-label="送信"
          >
            {isLoading ? (
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-xs text-center mt-2 flex items-center justify-center gap-1">
          {isLoading ? (
            <span className="text-emerald-400 flex items-center justify-center gap-2">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              動画を分析中です...しばらくお待ちください
            </span>
          ) : selectedCreators.length > 0 ? (
            <>
              <span className="text-emerald-400">
                「{getSelectedNames()}」の視点でアドバイスします
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-400 hover:text-emerald-400 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                title="他の人を追加"
                aria-label="他の人を追加"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </button>
            </>
          ) : (
            <span className="text-gray-400">
              審査する人を選択してください
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
