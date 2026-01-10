"use client";

import { useState, useEffect, useCallback } from "react";

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

interface FeedbackDetailModalProps {
  feedback: Feedback;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, note?: string) => void;
}

interface ImprovementResult {
  feedbackId: string;
  creatorId: string;
  original: string;
  improved: string;
  feedback: {
    rating: number | null;
    comment: string | null;
    message_type: string;
  };
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-500">未評価</span>;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-amber-400" : "text-gray-600"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function FeedbackDetailModal({
  feedback,
  onClose,
  onStatusUpdate,
}: FeedbackDetailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvement, setImprovement] = useState<ImprovementResult | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Generate AI improvement
  const handleGenerateImprovement = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/feedback/${feedback.id}/improve`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate improvement");
      }

      const result = await response.json();
      setImprovement(result);
    } catch (err) {
      setError("改善提案の生成に失敗しました");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [feedback.id]);

  // Copy improvement to clipboard
  const handleCopy = useCallback(async () => {
    if (!improvement?.improved) return;

    try {
      await navigator.clipboard.writeText(improvement.improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [improvement]);

  // Approve with improvement note
  const handleApprove = useCallback(() => {
    onStatusUpdate(feedback.id, "approved", improvement?.improved || undefined);
  }, [feedback.id, improvement, onStatusUpdate]);

  // Reject
  const handleReject = useCallback(() => {
    onStatusUpdate(feedback.id, "rejected");
  }, [feedback.id, onStatusUpdate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#2a2b32] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            フィードバック詳細
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Feedback info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <StarRating rating={feedback.rating} />
              <span className="text-sm text-gray-400">
                {feedback.message_type === "analysis"
                  ? "アカウント分析"
                  : "チャット"}
              </span>
              <div className="flex gap-1 ml-auto">
                {feedback.creators?.map((creator) => (
                  <span
                    key={creator}
                    className="px-2 py-0.5 text-xs bg-[#343541] rounded text-gray-400"
                  >
                    {creator}
                  </span>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                コメント
              </h3>
              {feedback.comment ? (
                <p className="text-white bg-[#343541] rounded-lg p-3">
                  {feedback.comment}
                </p>
              ) : (
                <p className="text-gray-500 italic">コメントなし</p>
              )}
            </div>

            {/* Original message */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                対象の回答
              </h3>
              <div className="bg-[#343541] rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {feedback.message_content || "内容なし"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Improvement Section */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-400">AI改善提案</h3>
              {!improvement && (
                <button
                  onClick={handleGenerateImprovement}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      生成中...
                    </span>
                  ) : (
                    "改善提案を生成"
                  )}
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {improvement && (
              <div className="space-y-4">
                {/* Improvement content */}
                <div className="bg-[#343541] rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                    {improvement.improved}
                  </pre>
                </div>

                {/* Copy button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-sm bg-[#40414f] hover:bg-[#565869] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-4 h-4 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        コピーしました
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        クリップボードにコピー
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-[#202123]">
          <button
            onClick={handleReject}
            disabled={feedback.status === "rejected"}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            却下
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg"
            >
              閉じる
            </button>
            <button
              onClick={handleApprove}
              disabled={feedback.status === "approved"}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              承認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
