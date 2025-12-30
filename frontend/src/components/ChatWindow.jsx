"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, Activity, X } from "lucide-react";

const ChatWindow = ({ mode, setMode, onAction, currentUserId, onShowAuthModal }) => { // Added currentUserId, onShowAuthModal
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (mode === "emergency") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "EMERGENCY PROTOCOL INITIATED. \nIs the patient conscious?",
          model: "System",
        },
      ]);
      setCurrentOptions(["Yes", "No"]);
    } else if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm Dr. Samantha. How can I help you today?",
          model: "sethuiyer/Dr_Samantha-7b",
        },
      ]);
    }
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, currentOptions]);

  const sendMessage = async (text) => {
    if (!currentUserId) { // Check if user is logged in
      onShowAuthModal(); // Show auth modal if not logged in
      return;
    }
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setCurrentOptions([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          mode: mode,
          user_id: currentUserId, // Use currentUserId prop
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const suggestedAction = response.headers.get("X-Suggested-Action");
      const modelName = response.headers.get("X-Model");

      if (suggestedAction) {
        onAction(suggestedAction);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMsgContent = "";
      let metronomeTriggered = false;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", model: modelName },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMsgContent += chunk;

        // Trigger Metronome if the bot says so (client-side detection)
        if (
          !metronomeTriggered &&
          botMsgContent.toLowerCase().includes("starting metronome")
        ) {
          onAction("start_metronome");
          metronomeTriggered = true;
        }

        // Parse Options Pattern: [OPTIONS: Opt1 | Opt2]
        let displayContent = botMsgContent;
        // Match with [\s\S] to handle potential newlines from the model
        // Relaxed regex: Case insensitive, optional space after colon, optional closing bracket (handles truncation)
        const optionsMatch = botMsgContent.match(
          /\[OPTIONS:?\s*([\s\S]*?)(?:\]|$)/i
        );

        if (optionsMatch) {
          const optionsStr = optionsMatch[1];
          // Clean up newlines and split
          const opts = optionsStr
            .replace(/\n/g, "")
            .split("|")
            .map((o) => o.trim())
            .filter((o) => o.length > 0);

          if (opts.length > 0) {
            setCurrentOptions(opts);
          }

          // Hide the options tag from the message bubble
          displayContent = botMsgContent.replace(optionsMatch[0], "");
        }

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = displayContent;
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection error. Please verify your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  return (
    <div
      className={`flex flex-col h-[600px] border rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 transition-colors duration-500 ${
        mode === "emergency"
          ? "border-red-500 border-2 shadow-red-100 dark:shadow-red-900"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div
        className={`p-4 ${
          mode === "emergency"
            ? "bg-red-600 text-white"
            : "bg-blue-600 text-white dark:bg-blue-800"
        } flex justify-between items-center transition-colors duration-500`}
      >
        <h3 className="font-bold flex items-center gap-2">
          {mode === "emergency" ? <Activity size={20} /> : <Bot size={20} />}
          {mode === "emergency" ? "EMERGENCY GUIDANCE" : "Medical Assistant"}
        </h3>
        {mode === "emergency" && (
          <button
            onClick={() => {
              setMode("general");
              setMessages([
                {
                  role: "assistant",
                  content: "Hello! I'm Dr. Samantha. How can I help you today?",
                  model: "sethuiyer/Dr_Samantha-7b",
                },
              ]);
              setCurrentOptions([]);
            }}
            className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
          >
            End Emergency
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none dark:bg-blue-700"
                  : mode === "emergency" && msg.role === "assistant"
                  ? "bg-red-100 text-gray-900 rounded-bl-none border border-red-200 dark:bg-red-900 dark:text-white dark:border-red-800 font-medium"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              }`}
            >
              <div className="text-sm md:text-base leading-relaxed markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-300 text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Options */}
      {mode === "emergency" && !isLoading && currentOptions.length > 0 && (
        <div className="px-6 py-4 bg-slate-900/50 dark:bg-gray-800/70 border-t border-border/30 dark:border-gray-700 flex gap-2 overflow-x-auto scrollbar-hide">
          {currentOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(opt)}
              className="whitespace-nowrap px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-full text-sm font-semibold text-accent transition-all duration-200 active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/30 dark:border-gray-700 bg-slate-900/50 dark:bg-gray-800/70 flex gap-3">
        {currentUserId ? ( // Conditional rendering based on login status
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), sendMessage(input))
              }
              placeholder={
                mode === "emergency"
                  ? "Respond here..."
                  : "Type your health question..."
              }
              className="input-base flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg"
            >
              <Send size={20} strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <button
            onClick={onShowAuthModal}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
          >
            Login or Sign Up to Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
