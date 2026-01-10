"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "@/lib/types";
import { isAdmin } from "@/lib/constants/admin";

interface UserProfileProps {
  user: User | null;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Guest mode - show login button
  if (!user) {
    return (
      <div className="border-t border-gray-700 p-2">
        <a
          href="/auth/login"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#202123]"
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
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          ログイン
        </a>
      </div>
    );
  }

  return (
    <div className="relative border-t border-gray-700 p-2">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2b32] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
            {user.display_name?.charAt(0) || user.email?.charAt(0) || "?"}
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
            {/* Admin: FB管理リンク */}
            {isAdmin(user.email) && (
              <>
                <Link
                  href="/admin/feedback"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#40414f] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
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
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
                    />
                  </svg>
                  FBを見る
                </Link>
                <div className="border-t border-gray-600 my-1" />
              </>
            )}
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#40414f] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset"
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
  );
}
