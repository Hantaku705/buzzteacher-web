"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VideoItem } from "@/lib/types";

interface VideoDetailRowProps {
  video: VideoItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return `${Math.floor(diffDays / 30)}ヶ月前`;
}

export function VideoDetailRow({
  video,
  index,
  isExpanded,
  onToggle,
}: VideoDetailRowProps) {
  return (
    <>
      <tr className="hover:bg-gray-700/50 transition-colors">
        <td className="px-2 py-3 text-center text-gray-400 border-b border-gray-700">
          {index}
        </td>
        <td className="px-3 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt=""
                className="w-12 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <span
              className="text-white text-sm truncate max-w-[180px]"
              title={video.desc}
            >
              {video.desc || "(説明なし)"}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 border-b border-gray-700 text-right text-white text-sm">
          {formatNumber(video.stats.playCount)}
        </td>
        <td className="px-3 py-3 border-b border-gray-700 text-right text-white text-sm">
          {formatNumber(video.stats.likeCount)}
        </td>
        <td className="px-3 py-3 border-b border-gray-700 text-right text-white text-sm">
          {video.metrics.lvr.toFixed(2)}%
        </td>
        <td className="px-3 py-3 border-b border-gray-700 text-right text-white text-sm">
          {video.metrics.er.toFixed(2)}%
        </td>
        <td className="px-3 py-3 border-b border-gray-700 text-gray-400 text-sm">
          {formatDate(video.createdAt)}
        </td>
        <td className="px-2 py-3 text-center border-b border-gray-700">
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label={isExpanded ? "詳細を閉じる" : "詳細を見る"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td
            colSpan={8}
            className="bg-gray-800/70 px-4 py-4 border-b border-gray-700"
          >
            <div className="space-y-4">
              {/* 詳細統計 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="text-gray-400 block text-xs">
                    コメント数
                  </span>
                  <span className="text-white font-medium">
                    {formatNumber(video.stats.commentCount)}
                  </span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="text-gray-400 block text-xs">シェア数</span>
                  <span className="text-white font-medium">
                    {formatNumber(video.stats.shareCount)}
                  </span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="text-gray-400 block text-xs">保存数</span>
                  <span className="text-white font-medium">
                    {formatNumber(video.stats.collectCount)}
                  </span>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <span className="text-gray-400 block text-xs">保存率</span>
                  <span className="text-white font-medium">
                    {video.metrics.saveRate.toFixed(3)}%
                  </span>
                </div>
              </div>

              {/* AI分析 */}
              {video.analysis ? (
                <div>
                  <h4 className="text-emerald-400 font-medium mb-2 text-sm">
                    AI分析
                  </h4>
                  <div className="text-white text-sm leading-relaxed bg-gray-700/30 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {video.analysis}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : video.error ? (
                <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">
                  分析エラー: {video.error}
                </div>
              ) : (
                <div className="text-gray-400 text-sm italic">
                  分析データなし
                </div>
              )}

              {/* TikTokリンク */}
              <div className="flex gap-2">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTokで開く
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
