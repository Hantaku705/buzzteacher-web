'use client'

import { useState, useRef, useEffect } from 'react'
import { AVAILABLE_CREATORS, CreatorInfo } from '@/lib/knowledge/loader'

interface CreatorProfileProps {
  selectedCreators: string[]
  onSelectCreators: (ids: string[]) => void
}

export function CreatorProfile({ selectedCreators, onSelectCreators }: CreatorProfileProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 選択中のCreator情報を取得
  const selectedCreatorInfos = selectedCreators
    .map(id => AVAILABLE_CREATORS.find(c => c.id === id))
    .filter((c): c is CreatorInfo => c !== undefined)

  // 外側クリックでメニューを閉じる
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

  const toggleCreator = (id: string) => {
    if (selectedCreators.includes(id)) {
      // 最低1人は選択を維持
      if (selectedCreators.length > 1) {
        onSelectCreators(selectedCreators.filter(c => c !== id))
      }
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

  // イニシャルを取得
  const getInitial = (name: string) => {
    return name.charAt(0)
  }

  // 表示用のCreator名
  const getDisplayName = () => {
    if (selectedCreatorInfos.length === 0) return '未選択'
    if (selectedCreatorInfos.length === 1) return selectedCreatorInfos[0].name
    if (selectedCreatorInfos.length === AVAILABLE_CREATORS.length) return '全員'
    return `${selectedCreatorInfos.length}人選択中`
  }

  return (
    <div className="p-2 border-b border-gray-700" ref={menuRef}>
      {/* メインのCreator表示 */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2b32] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {/* アバター（複数選択時は重ねて表示） */}
        <div className="relative flex-shrink-0">
          {selectedCreatorInfos.slice(0, 3).map((creator, index) => (
            <div
              key={creator.id}
              className={`w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium border-2 border-[#202123] ${
                index > 0 ? 'absolute top-0' : ''
              }`}
              style={{
                left: index > 0 ? `${index * 12}px` : undefined,
                zIndex: 3 - index,
              }}
            >
              {creator.imageUrl ? (
                <img
                  src={creator.imageUrl}
                  alt={creator.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitial(creator.name)
              )}
            </div>
          ))}
          {selectedCreatorInfos.length > 3 && (
            <div
              className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium border-2 border-[#202123] absolute top-0"
              style={{ left: '36px', zIndex: 0 }}
            >
              +{selectedCreatorInfos.length - 3}
            </div>
          )}
        </div>

        {/* 名前と説明 */}
        <div className="flex-1 text-left min-w-0" style={{ marginLeft: selectedCreatorInfos.length > 1 ? `${Math.min(selectedCreatorInfos.length - 1, 2) * 12}px` : 0 }}>
          <div className="text-sm text-white font-medium truncate">
            {getDisplayName()}
          </div>
          {selectedCreatorInfos.length === 1 && (
            <div className="text-xs text-gray-400 truncate">
              {selectedCreatorInfos[0].description}
            </div>
          )}
        </div>

        {/* 矢印アイコン */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {menuOpen && (
        <div className="mt-2 bg-[#2f2f2f] rounded-lg shadow-xl border border-gray-600 py-2 z-50">
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-600">
            アドバイスする人を選択
          </div>

          {/* 全員選択 */}
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

          {/* Creator一覧 */}
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

                {/* アバター */}
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {creator.imageUrl ? (
                    <img
                      src={creator.imageUrl}
                      alt={creator.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitial(creator.name)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{creator.name}</span>
                    <span className={`text-xs flex-shrink-0 ${
                      creator.dataCount > 0 ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {creator.dataCount > 0 ? `${creator.dataCount}件` : '準備中'}
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
  )
}
