"use client";

import { useState, useMemo } from "react";
import { VideoItem } from "@/lib/types";
import { VideoDetailRow } from "./VideoDetailRow";

type SortKey = "createdAt" | "playCount" | "likeCount" | "lvr" | "er";

interface VideoAnalysisTableProps {
  videos: VideoItem[];
}

export function VideoAnalysisTable({ videos }: VideoAnalysisTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("playCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      let aVal: number, bVal: number;
      switch (sortKey) {
        case "createdAt":
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case "playCount":
          aVal = a.stats.playCount;
          bVal = b.stats.playCount;
          break;
        case "likeCount":
          aVal = a.stats.likeCount;
          bVal = b.stats.likeCount;
          break;
        case "lvr":
          aVal = a.metrics.lvr;
          bVal = b.metrics.lvr;
          break;
        case "er":
          aVal = a.metrics.er;
          bVal = b.metrics.er;
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [videos, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const SortHeader = ({
    label,
    sortKeyName,
    className = "",
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
  }) => (
    <th
      onClick={() => handleSort(sortKeyName)}
      className={`px-3 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider cursor-pointer hover:bg-gray-600/50 transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-emerald-300">
            {sortOrder === "desc" ? "↓" : "↑"}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
        <span>📹</span>
        <span>動画一覧（{videos.length}件）</span>
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-2 py-3 text-center text-xs text-gray-400 font-medium w-10">
                #
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-emerald-400 uppercase tracking-wider min-w-[200px]">
                動画
              </th>
              <SortHeader label="再生数" sortKeyName="playCount" />
              <SortHeader label="いいね" sortKeyName="likeCount" />
              <SortHeader label="LVR" sortKeyName="lvr" />
              <SortHeader label="ER" sortKeyName="er" />
              <SortHeader label="投稿日" sortKeyName="createdAt" />
              <th className="px-2 py-3 text-center text-xs text-gray-400 font-medium w-12">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/50">
            {sortedVideos.map((video, index) => (
              <VideoDetailRow
                key={video.id}
                video={video}
                index={index + 1}
                isExpanded={expandedId === video.id}
                onToggle={() =>
                  setExpandedId(expandedId === video.id ? null : video.id)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ※ ヘッダーをクリックでソート切替
      </p>
    </div>
  );
}
