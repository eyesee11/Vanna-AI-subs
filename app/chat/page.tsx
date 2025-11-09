"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Code, Loader2, Trash2 } from "lucide-react";
import { chatWithData, type ChatResponse } from "@/lib/api";

// Message interface for chat history
interface Message {
  id: string;
  type: "user" | "assistant";
  question: string;
  sql?: string;
  results?: any[];
  error?: string;
}

// Local storage key for persistent chat
const CHAT_HISTORY_KEY = "buchhaltung_chat_history";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Clear chat history
  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      question: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithData(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        question: response.question,
        sql: response.sql,
        results: response.results,
        error: response.error || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        question: input,
        error:
          error instanceof Error ? error.message : "Failed to process query",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "What is the total spend in the last 30 days?",
    "Show me the top 5 vendors by spend",
    "How many unpaid invoices do we have?",
    "What is the average invoice amount?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Chat with Your Data
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your invoices in natural language
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Start a Conversation
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Ask questions about your data and get instant insights with SQL
            queries
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setInput(query)}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-700">{query}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "user" ? (
                <div className="flex justify-end mb-4">
                  <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 max-w-[70%]">
                    {message.question}
                  </div>
                </div>
              ) : (
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900">
                      {message.error ? "Error" : "Response"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {message.error ? (
                      <div className="text-red-600 text-sm">
                        {message.error}
                      </div>
                    ) : (
                      <>
                        {message.sql && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Code className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Generated SQL
                              </span>
                            </div>
                            <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-sm overflow-x-auto">
                              <code className="text-gray-800">
                                {message.sql}
                              </code>
                            </pre>
                          </div>
                        )}
                        {message.results && message.results.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Results ({message.results.length} rows)
                            </div>
                            <div className="border border-gray-200 rounded overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                    {Object.keys(message.results[0]).map(
                                      (key) => (
                                        <th
                                          key={key}
                                          className="px-4 py-2 text-left font-medium text-gray-700"
                                        >
                                          {key}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {message.results.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-b border-gray-100 last:border-0"
                                    >
                                      {Object.values(row).map(
                                        (value: any, vidx) => (
                                          <td
                                            key={vidx}
                                            className="px-4 py-2 text-gray-900"
                                          >
                                            {value !== null &&
                                            value !== undefined
                                              ? String(value)
                                              : "-"}
                                          </td>
                                        )
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        {message.results && message.results.length === 0 && (
                          <div className="text-gray-500 text-sm">
                            No results found
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Processing query...</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your data..."
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
}
