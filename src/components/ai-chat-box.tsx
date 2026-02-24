import { useState } from "react";
import { Button } from "./ui/button";
import { Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/store/authstore";

export function AIChatBox() {
  const [message, setMessage] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ type: "user" | "ai"; content: string }>
  >([
    {
      type: "ai",
      content: "Hello! I'm your AI health assistant. How can I help you today?",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { type: "user", content: message }]);

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          content:
            "I'm a demo AI assistant. In the full version, I'll be able to help you with health-related questions!",
        },
      ]);
    }, 1000);

    setMessage("");
  };

  const handleClearChat = async () => {
    if (isClearing) return;
    setIsClearing(true);

    // Optimistically clear UI first
    setChatHistory([
      {
        type: "ai",
        content: "Chat cleared. How can I assist you now?",
      },
    ]);

    try {
      // Use Zustand to check if user is logged in (matches your PR's goal!)
      const isUserLoggedIn = useAuthStore.getState().user !== null;

      if (isUserLoggedIn) {
        // Use your new centralized API instance
        await api.delete('/ai-chat/history');
        toast.success("Chat history cleared from server");
      } else {
        // Just show success for demo mode
        toast.success("Demo chat cleared");
      }
    } catch (error) {
      console.error("Error clearing backend chat history:", error);
      // Don't show error toast if it's just a demo/guest session
      // or at least make the failure non-blocking for the UI
      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        toast.error("Failed to sync clear with server");
      }
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          AI Assistant
        </span>
        <Button variant="outline" size="sm" onClick={handleClearChat} disabled={isClearing}>
          <Trash2 className="h-4 w-4 mr-2" />
          {isClearing ? "Clearing..." : "Clear chat"}
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${msg.type === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}