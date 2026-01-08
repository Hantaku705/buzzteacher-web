'use client'

import { useState } from 'react'
import { User } from '@/lib/types'

interface UserProfileProps {
  user: User | null
  onLogout: () => void
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative border-t border-gray-700 p-2">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2b32] transition-colors"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
            {user.display_name?.charAt(0) || user.email?.charAt(0) || '?'}
          </div>
        )}
        <div className="flex-1 text-left">
          <div className="text-sm text-white truncate">
            {user.display_name || user.email}
          </div>
        </div>
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
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#2a2b32] rounded-lg shadow-lg border border-gray-600 py-1 z-20">
            <button
              onClick={() => {
                onLogout()
                setMenuOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#40414f] flex items-center gap-2"
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
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                />
              </svg>
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  )
}
