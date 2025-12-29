"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, Activity, X } from "lucide-react";

const ChatWindow = ({ mode, setMode, onAction }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const bottomRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (mode === "emergency") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🚨 EMERGENCY PROTOCOL ACTIVATED\n\nI'm connecting you to emergency guidance. Is the patient conscious?",
          model: "System",
        },
      ]);
      setCurrentOptions(["Yes", "No"]);
    } else if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello, I'm your medical assistant. How can I help you today? I can provide guidance on symptoms, first aid, and emergency protocols.",
          model: "Medical Assistant",
        },
      ]);
    }
  }, [mode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, currentOptions]);

  const sendMessage = async (text) => {
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
          user_id: userId,
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

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", model: modelName },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        botMsgContent += chunk;

        let displayContent = botMsgContent;
        const optionsMatch = botMsgContent.match(/\[OPTIONS: (.*?)\]/);

        if (optionsMatch) {
          const optionsStr = optionsMatch[1];
          const opts = optionsStr.split("|").map((o) => o.trim());
          setCurrentOptions(opts);
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
      className={`flex flex-col h-full border rounded-2xl overflow-hidden card-elevated transition-all duration-300 ${
        mode === "emergency"
          ? "glass-primary border-accent/50 bg-gradient-to-b from-accent/5 to-transparent"
          : "glass-primary border-border/50"
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          mode === "emergency"
            ? "bg-gradient-to-r from-accent/20 to-accent/10 border-b border-accent/20"
            : "bg-slate-900/50 border-b border-border/30"
        }`}
      >
        <h3 className="font-bold flex items-center gap-3 text-text-primary">
          {mode === "emergency" ? (
            <>
              <Activity
                size={20}
                className="text-accent animate-smooth-scale"
              />
              <span>Emergency Guidance</span>
            </>
          ) : (
            <>
              <Bot size={20} className="text-accent" />
              <span>Medical Assistant</span>
            </>
          )}
        </h3>
        {mode === "emergency" && (
          <button
            onClick={() => setMode("general")}
            className="text-xs bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <X size={14} />
            End
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl transition-all duration-200 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-accent to-accent-dark text-white rounded-br-none shadow-lg"
                  : mode === "emergency" && msg.role === "assistant"
                  ? "bg-accent/10 text-text-primary rounded-bl-none border border-accent/20"
                  : "bg-slate-900/50 text-text-primary rounded-bl-none border border-border/30"
              }`}
            >
              <div className="text-sm md:text-base leading-relaxed">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.model && (
                <p className="text-[10px] mt-2 opacity-50 text-right uppercase tracking-wider">
                  {msg.model}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-slate-900/50 border border-border/30 p-4 rounded-2xl rounded-bl-none text-text-secondary text-sm flex items-center gap-2">
              <div
                className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Options */}
      {mode === "emergency" && !isLoading && currentOptions.length > 0 && (
        <div className="px-6 py-4 bg-slate-900/50 border-t border-border/30 flex gap-2 overflow-x-auto scrollbar-hide">
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
      <div className="px-6 py-4 border-t border-border/30 bg-slate-900/50 flex gap-3">
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
          className="input-base flex-1"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading}
          className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
