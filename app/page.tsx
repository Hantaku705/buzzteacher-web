"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageList } from "@/components/chat/MessageList";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Message,
  Conversation,
  User,
  CreatorSection,
  DiscussionTurn,
  DiscussionFinal,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import type { ProgressStep } from "@/components/chat/AnalysisProgress";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [loadingPercent, setLoadingPercent] = useState<number | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<ProgressStep[] | null>(null);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([
    "doshirouto",
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+C or Ctrl+Shift+C - New Chat
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        e.preventDefault();
        handleNewChat();
      }
      // Cmd+/ or Ctrl+/ - Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
      // Escape - Close shortcuts modal
      if (e.key === "Escape" && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  // Initialize user and conversations
  useEffect(() => {
    async function init() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            display_name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "",
            avatar_url: authUser.user_metadata?.avatar_url || null,
          });
          await loadConversations();
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.messages?.map(
            (m: {
              id: string;
              role: "user" | "assistant";
              content: string;
              creators?: string[];
              created_at: string;
            }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              creators: m.creators,
              createdAt: new Date(m.created_at),
            }),
          ) || [],
        );
        setCurrentConversationId(id);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      await loadConversation(id);
    },
    [loadConversation],
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (currentConversationId === id) {
            handleNewChat();
          }
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    },
    [currentConversationId, handleNewChat],
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }, [supabase.auth]);

  const saveMessage = useCallback(
    async (
      conversationId: string,
      role: "user" | "assistant",
      content: string,
      creators?: string[],
    ) => {
      try {
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, content, creators }),
        });
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    },
    [],
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create or get conversation (only for authenticated users)
    let convId = currentConversationId;
    if (user && !convId) {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: content.slice(0, 50),
            creators: selectedCreators,
          }),
        });
        if (response.ok) {
          const newConv = await response.json();
          convId = newConv.id;
          setCurrentConversationId(convId);
          setConversations((prev) => [newConv, ...prev]);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }

    // Save user message (only for authenticated users)
    if (user && convId) {
      await saveMessage(convId, "user", content);
    }

    // Create placeholder for assistant message with creators
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        creators: selectedCreators,
        createdAt: new Date(),
      },
    ]);

    let fullContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          creators: selectedCreators,
          conversationId: convId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `APIエラー: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      const sections: CreatorSection[] = [];
      let currentSection: CreatorSection | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);

              if (json.type === "progress") {
                setLoadingStage(json.stage);
                if (json.percent !== undefined) {
                  setLoadingPercent(json.percent);
                }
                if (json.steps) {
                  setLoadingSteps(json.steps);
                }
              } else if (json.type === "creator_start") {
                currentSection = {
                  creatorId: json.creatorId,
                  creatorName: json.name,
                  content: "",
                  isStreaming: true,
                };
                sections.push(currentSection);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, creatorSections: [...sections] }
                      : m,
                  ),
                );
              } else if (json.type === "creator_end") {
                if (currentSection) {
                  currentSection.isStreaming = false;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, creatorSections: [...sections] }
                        : m,
                    ),
                  );
                }
              } else {
                const chunk = json.choices?.[0]?.delta?.content || "";
                if (chunk) {
                  if (currentSection) {
                    currentSection.content += chunk;
                    fullContent = sections
                      .map((s) => `## ${s.creatorName}\n${s.content}`)
                      .join("\n\n");
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId
                          ? {
                              ...m,
                              content: fullContent,
                              creatorSections: [...sections],
                            }
                          : m,
                      ),
                    );
                  } else {
                    fullContent += chunk;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: fullContent }
                          : m,
                      ),
                    );
                  }
                }
              }
            } catch {
              if (currentSection) {
                currentSection.content += data;
                fullContent = sections
                  .map((s) => `## ${s.creatorName}\n${s.content}`)
                  .join("\n\n");
              } else {
                fullContent += data;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: fullContent,
                        creatorSections:
                          sections.length > 0 ? [...sections] : undefined,
                      }
                    : m,
                ),
              );
            }
          }
        }
      }

      // Mark as discussion-ready if multiple creators
      if (sections.length > 1) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, canStartDiscussion: true }
              : m,
          ),
        );
      }

      // Save assistant message (only for authenticated users)
      if (user && convId && fullContent) {
        await saveMessage(convId, "assistant", fullContent, selectedCreators);
        await loadConversations();
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      fullContent = `エラー: ${errorMessage}`;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId ? { ...m, content: fullContent } : m,
        ),
      );
    } finally {
      setIsLoading(false);
      setLoadingStage(null);
      setLoadingPercent(null);
      setLoadingSteps(null);
    }
  };

  const handleRegenerate = useCallback(() => {
    // Find the last user message
    const lastUserMessageIndex = messages
      .map((m) => m.role)
      .lastIndexOf("user");
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];

    // Remove the last assistant message
    setMessages((prev) => prev.slice(0, -1));

    // Resend the last user message
    handleSendMessage(lastUserMessage.content);
  }, [messages]);

  const handleEditMessage = useCallback(
    (messageId: string, newContent: string) => {
      // Find the message index
      const messageIndex = messages.findIndex((m) => m.id === messageId);
      if (messageIndex === -1) return;

      // Remove all messages from the edited message onwards
      setMessages((prev) => prev.slice(0, messageIndex));

      // Send the edited content as a new message
      handleSendMessage(newContent);
    },
    [messages],
  );

  const handleStartDiscussion = useCallback(
    async (messageId: string) => {
      // Find the message with creator sections
      const message = messages.find((m) => m.id === messageId);
      if (
        !message ||
        !message.creatorSections ||
        message.creatorSections.length < 2
      ) {
        console.error(
          "Cannot start discussion: need at least 2 creator analyses",
        );
        return;
      }

      // Mark the message as having an ongoing discussion
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, discussion: [], canStartDiscussion: false }
            : m,
        ),
      );

      setIsLoading(true);

      try {
        // Prepare previous analyses for the API
        const previousAnalyses = message.creatorSections.map((section) => ({
          creatorId: section.creatorId,
          creatorName: section.creatorName,
          content: section.content,
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "discussion" }],
            discussionMode: true,
            previousAnalyses,
          }),
        });

        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let buffer = "";
        const discussionTurns: DiscussionTurn[] = [];
        let currentTurn: DiscussionTurn | null = null;
        let discussionFinal: DiscussionFinal | null = null;
        let isStreamingFinal = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const json = JSON.parse(data);

                if (json.type === "discussion_start") {
                  // 議論開始
                  setLoadingStage("審査員ディスカッション中...");
                } else if (json.type === "discussion_turn") {
                  // 新しい発言開始
                  currentTurn = {
                    creatorId: json.creatorId,
                    creatorName: json.creatorName,
                    content: "",
                    replyTo: json.replyTo || undefined,
                    isStreaming: true,
                  };
                  discussionTurns.push(currentTurn);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === messageId
                        ? { ...m, discussion: [...discussionTurns] }
                        : m,
                    ),
                  );
                } else if (json.type === "discussion_turn_end") {
                  // 発言終了
                  if (currentTurn) {
                    currentTurn.isStreaming = false;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === messageId
                          ? { ...m, discussion: [...discussionTurns] }
                          : m,
                      ),
                    );
                  }
                } else if (json.type === "discussion_final") {
                  // 最終統合案開始
                  isStreamingFinal = true;
                  currentTurn = null; // 通常の発言を終了
                  discussionFinal = {
                    content: "",
                    isStreaming: true,
                  };
                  setLoadingStage("最終統合案を生成中...");
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === messageId
                        ? {
                            ...m,
                            discussion: [...discussionTurns],
                            discussionFinal: { ...discussionFinal! },
                          }
                        : m,
                    ),
                  );
                } else if (json.type === "discussion_final_end") {
                  // 最終統合案終了
                  isStreamingFinal = false;
                  if (discussionFinal) {
                    discussionFinal.isStreaming = false;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === messageId
                          ? {
                              ...m,
                              discussionFinal: { ...discussionFinal! },
                            }
                          : m,
                      ),
                    );
                  }
                } else if (json.type === "discussion_end") {
                  // 議論終了
                  setLoadingStage(null);
                } else {
                  // 通常のテキストチャンク
                  const chunk = json.choices?.[0]?.delta?.content || "";
                  if (chunk) {
                    if (isStreamingFinal && discussionFinal) {
                      // 最終統合案にチャンクを追加
                      discussionFinal.content += chunk;
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === messageId
                            ? {
                                ...m,
                                discussionFinal: { ...discussionFinal! },
                              }
                            : m,
                        ),
                      );
                    } else if (currentTurn) {
                      // 通常の発言にチャンクを追加
                      currentTurn.content += chunk;
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === messageId
                            ? { ...m, discussion: [...discussionTurns] }
                            : m,
                        ),
                      );
                    }
                  }
                }
              } catch {
                // JSONパースエラー時はテキストとして扱う
                if (isStreamingFinal && discussionFinal) {
                  discussionFinal.content += data;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === messageId
                        ? { ...m, discussionFinal: { ...discussionFinal! } }
                        : m,
                    ),
                  );
                } else if (currentTurn) {
                  currentTurn.content += data;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === messageId
                        ? { ...m, discussion: [...discussionTurns] }
                        : m,
                    ),
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Discussion error:", error);
        // エラー時は議論開始可能に戻す
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, discussion: undefined, canStartDiscussion: true }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        setLoadingStage(null);
      }
    },
    [messages],
  );

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#343541]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#343541]">
      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-[#40414f] rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                キーボードショートカット
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-white p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">新規チャット</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    ⌘
                  </kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    ⇧
                  </kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    C
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">ショートカット一覧</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    ⌘
                  </kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    /
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">メッセージ送信</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    Enter
                  </kbd>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">改行</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    ⇧
                  </kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                    Enter
                  </kbd>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Windows/Linuxでは ⌘ の代わりに Ctrl を使用
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedCreators={selectedCreators}
        onSelectCreators={setSelectedCreators}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center px-4 py-3 border-b border-gray-700">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 mr-2 text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white flex-1 text-center md:text-left">
            BuzzTeacher
          </h1>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <div className="text-4xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                BuzzTeacher
              </h2>
              <p className="text-center max-w-md mb-4">
                動画URLを送信すると、バズのプロが分析・アドバイスします。
                <br />
                TikTok, Instagram, YouTube, X に対応しています。
              </p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              onRegenerate={handleRegenerate}
              onEdit={handleEditMessage}
              onStartDiscussion={handleStartDiscussion}
              isLoading={isLoading}
              loadingStage={loadingStage}
              loadingPercent={loadingPercent}
              loadingSteps={loadingSteps}
            />
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          selectedCreators={selectedCreators}
          onSelectCreators={setSelectedCreators}
        />
      </div>
    </div>
  );
}
