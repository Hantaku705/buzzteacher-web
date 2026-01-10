"use client";

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

interface FeedbackListProps {
  feedbacks: Feedback[];
  onSelect: (feedback: Feedback) => void;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-gray-500 text-sm">未評価</span>;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-amber-900/50 text-amber-300 border-amber-700",
    approved: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    rejected: "bg-gray-700/50 text-gray-400 border-gray-600",
  };

  const labels = {
    pending: "未処理",
    approved: "承認済",
    rejected: "却下",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs rounded border ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function FeedbackList({ feedbacks, onSelect }: FeedbackListProps) {
  return (
    <div className="space-y-3">
      {feedbacks.map((feedback) => (
        <button
          key={feedback.id}
          onClick={() => onSelect(feedback)}
          className="w-full text-left bg-[#2a2b32] rounded-lg p-4 hover:bg-[#40414f] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Rating and Comment */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={feedback.rating} />
                <StatusBadge status={feedback.status} />
                <span className="text-xs text-gray-500">
                  {feedback.message_type === "analysis"
                    ? "アカウント分析"
                    : "チャット"}
                </span>
              </div>

              {/* Comment */}
              {feedback.comment ? (
                <p className="text-sm text-gray-300 mb-2">
                  {truncate(feedback.comment, 100)}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mb-2 italic">
                  コメントなし
                </p>
              )}

              {/* Message preview */}
              <p className="text-xs text-gray-500 truncate">
                回答: {truncate(feedback.message_content || "", 80)}
              </p>
            </div>

            {/* Right: Creators and Date */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex gap-1">
                {feedback.creators?.slice(0, 2).map((creator) => (
                  <span
                    key={creator}
                    className="px-2 py-0.5 text-xs bg-[#343541] rounded text-gray-400"
                  >
                    {creator}
                  </span>
                ))}
                {feedback.creators?.length > 2 && (
                  <span className="px-2 py-0.5 text-xs bg-[#343541] rounded text-gray-400">
                    +{feedback.creators.length - 2}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(feedback.created_at)}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
