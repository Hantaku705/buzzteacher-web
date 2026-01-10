"use client";

import { AVAILABLE_CREATORS } from "@/lib/knowledge/loader";

interface CreatorSelectorProps {
  selectedCreator: string | null;
  onSelect: (creatorId: string | null) => void;
}

export function CreatorSelector({
  selectedCreator,
  onSelect,
}: CreatorSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm hidden sm:inline">審査:</span>
      <select
        value={selectedCreator || "all"}
        onChange={(e) =>
          onSelect(e.target.value === "all" ? null : e.target.value)
        }
        className="bg-[#40414f] text-white text-sm rounded-md border border-gray-600 px-2 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
      >
        <option value="all">全員のナレッジ</option>
        {AVAILABLE_CREATORS.map((creator) => (
          <option key={creator.id} value={creator.id}>
            {creator.name}
          </option>
        ))}
      </select>
    </div>
  );
}
