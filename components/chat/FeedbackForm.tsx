"use client";

import { useState } from "react";

interface FeedbackFormProps {
  messageId: string;
  creators: string[];
  messageContent: string;
  messageType: "chat" | "analysis";
  onSubmitted?: () => void;
}

export function FeedbackForm({
  messageId,
  creators,
  messageContent,
  messageType,
  onSubmitted,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          creators,
          rating,
          comment: comment.trim() || null,
          messageContent,
          messageType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setIsSubmitted(true);
      onSubmitted?.();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (star: number) => {
    if (rating === star) {
      setRating(null); // Deselect if clicking the same star
    } else {
      setRating(star);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 animate-fade-in">
        <svg
          className="w-4 h-4 text-emerald-500"
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
        <span>フィードバックありがとうございます</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500">
          この回答は役に立ちましたか？
        </span>

        {/* Star Rating */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="min-h-[44px] min-w-[36px] p-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded active:scale-90 hover:scale-110"
              aria-label={`${star}点`}
            >
              <svg
                className={`w-6 h-6 transition-all ${
                  (
                    hoveredRating !== null
                      ? star <= hoveredRating
                      : star <= (rating || 0)
                  )
                    ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "text-gray-500 hover:text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Comment Toggle */}
        <button
          onClick={() => setShowComment(!showComment)}
          className="text-sm text-gray-500 hover:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
        >
          {showComment ? "コメントを閉じる" : "コメントを追加"}
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (rating === null && comment.trim() === "")}
          className="min-h-[44px] px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {isSubmitting ? "送信中..." : "送信"}
        </button>
      </div>

      {/* Comment Input */}
      {showComment && (
        <div className="animate-fade-in">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="改善点やご意見があればお聞かせください..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
