"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, Activity, Mic, Volume2, VolumeX } from "lucide-react";

const ChatWindow = ({
  mode,
  setMode,
  onAction,
  currentUserId,
  onShowAuthModal,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(messages);
  const silenceTimerRef = useRef(null);

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const userId = currentUserId || localStorage.getItem("user_id");

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setCurrentOptions([]);

    try {
      const currentHistory = messagesRef.current.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        "https://reddragonnm.pythonanywhere.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            mode: mode,
            user_id: userId,
            history: currentHistory,
          }),
        }
      );

      if (!response.ok) {
        console.log(response);
        throw new Error("Network response was not ok");
      }

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

        if (
          !metronomeTriggered &&
          botMsgContent.toLowerCase().includes("starting metronome")
        ) {
          onAction("start_metronome");
          metronomeTriggered = true;
        }

        let displayContent = botMsgContent;
        // Robust Regex: Matches [OPTIONS: ...] with optional space/colon, allowing any content inside, until closing bracket.
        const optionsMatch = botMsgContent.match(
          /\[\s*OPTIONS\s*:?[\s\S]*?\]/i
        );

        if (optionsMatch) {
          // Extract content inside brackets: [OPTIONS: content ]
          // Remove the [OPTIONS: and the ]
          const innerContent = optionsMatch[0]
            .replace(/^\s*\[\s*OPTIONS\s*:?/i, "")
            .replace(/\s*\]$/, "");

          const opts = innerContent
            .split("|")
            .map((o) => o.trim())
            .filter((o) => o.length > 0);

          if (opts.length > 0) {
            setCurrentOptions(opts);
          }

          // Remove the tag from the display text
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

      if (voiceModeRef.current) {
        let finalDisplay = botMsgContent;
        const finalMatch = botMsgContent.match(/\[\s*OPTIONS\s*:?[\s\S]*?\]/i);
        if (finalMatch) {
          finalDisplay = botMsgContent.replace(finalMatch[0], "");
        }
        speak(finalDisplay);
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

  const voiceModeRef = useRef(voiceMode);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        setInput(fullTranscript);

        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsListening(false);
          if (fullTranscript.trim()) {
            sendMessageRef.current(fullTranscript);
          }
        }, 2000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognitionRef.current.onend = () => {
        // Optionally handle end
      };
    }
  }, []);

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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentOptions]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Attempt to select a more human-sounding female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = [
      "Google US English", // Chrome (Natural sounding)
      "Microsoft Zira", // Windows
      "Samantha", // macOS
      "Google UK English Female",
    ];

    const selectedVoice =
      voices.find((voice) =>
        preferredVoices.some((pref) => voice.name.includes(pref))
      ) || voices.find((voice) => voice.name.toLowerCase().includes("female"));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current.stop();
      setIsListening(false);
      if (input.trim()) {
        sendMessage(input);
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${
              voiceMode ? "bg-white/20" : ""
            }`}
            title={voiceMode ? "Mute Voice Output" : "Enable Voice Output"}
          >
            {voiceMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          {mode === "emergency" && (
            <button
              onClick={() => {
                setMode("general");
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Hello! I'm Dr. Samantha. How can I help you today?",
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
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
      >
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
      </div>

      {/* Options */}
      {mode === "emergency" && !isLoading && currentOptions.length > 0 && (
        <div className="px-6 py-4 bg-slate-900/50 dark:bg-gray-800/70 border-t border-border/30 dark:border-gray-700 flex gap-2 overflow-x-auto scrollbar-hide">
          {currentOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(opt)}
              className="whitespace-nowrap px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full text-sm font-semibold text-red-500 transition-all duration-200 active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border/30 dark:border-gray-700 bg-slate-900/50 dark:bg-gray-800/70 flex gap-3">
        {userId ? (
          <>
            <button
              onClick={toggleListening}
              className={`p-3 rounded-lg transition-colors ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
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
                isListening
                  ? "Listening..."
                  : mode === "emergency"
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
          <div className="w-full flex items-center justify-center">
            <button
              onClick={onShowAuthModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Login to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
