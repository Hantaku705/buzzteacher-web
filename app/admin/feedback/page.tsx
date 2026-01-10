"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/constants/admin";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { FeedbackDetailModal } from "@/components/admin/FeedbackDetailModal";

interface Feedback {
  id: string;
  message_id: string;
  rating: number | null;
  comment: string | null;
  creators: string[];
  message_content: string;
  message_type: string;
  status: string;
  created_at: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
  total: number;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  // Check authorization
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isAdmin(user.email)) {
        router.push("/");
        return;
      }

      setIsAuthorized(true);
      fetchFeedbacks();
    }

    checkAuth();
  }, [router]);

  // Fetch feedbacks
  async function fetchFeedbacks(status?: string) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.set("status", status);
      }

      const response = await fetch(`/api/admin/feedback?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setFeedbacks(data.feedbacks);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle status filter change
  function handleStatusChange(status: string) {
    setStatusFilter(status);
    fetchFeedbacks(status);
  }

  // Handle feedback update
  async function handleStatusUpdate(id: string, status: string, note?: string) {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, improvement_note: note }),
      });

      if (!response.ok) throw new Error("Failed to update");

      // Refresh list
      fetchFeedbacks(statusFilter);
      setSelectedFeedback(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#343541] flex items-center justify-center">
        <div className="text-gray-400">認証確認中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#343541]">
      {/* Header */}
      <header className="bg-[#202123] border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-white">
              フィードバック管理
            </h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-6 text-sm">
              <div className="text-gray-400">
                未処理:{" "}
                <span className="text-amber-400 font-medium">
                  {stats.pending}
                </span>
              </div>
              <div className="text-gray-400">
                承認済:{" "}
                <span className="text-emerald-400 font-medium">
                  {stats.approved}
                </span>
              </div>
              <div className="text-gray-400">
                却下:{" "}
                <span className="text-gray-500 font-medium">
                  {stats.rejected}
                </span>
              </div>
              <div className="text-gray-400">
                平均評価:{" "}
                <span className="text-white font-medium">
                  {stats.avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Filter tabs */}
      <div className="bg-[#202123] border-b border-gray-700 px-6 py-2">
        <div className="max-w-6xl mx-auto flex gap-2">
          {[
            { value: "all", label: "すべて" },
            { value: "pending", label: "未処理" },
            { value: "approved", label: "承認済" },
            { value: "rejected", label: "却下" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                statusFilter === tab.value
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#2a2b32]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">読み込み中...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            フィードバックがありません
          </div>
        ) : (
          <FeedbackList feedbacks={feedbacks} onSelect={setSelectedFeedback} />
        )}
      </main>

      {/* Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
