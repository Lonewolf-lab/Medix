import { useState, useEffect, useRef } from "react";
import { chatApi } from "@/api/chatApi";
import { medicationApi } from "@/api/medicationApi";
import { symptomApi } from "@/api/symptomApi";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Send,
  Cpu,
  Plus,
  Clock,
} from "lucide-react";

// Markdown Parser Helper
const formatChatMessage = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*|\n)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part === "\n") {
      return <br key={index} />;
    }
    return part;
  });
};

const SUGGESTION_CHIPS = [
  "Summarize my active medications and schedule",
  "Analyze my overall cardiovascular health indicators",
  "Review my recent symptom checker history",
  "Provide lifestyle guidance for cholesterol management",
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Thread History States
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [currentThreadMessages, setCurrentThreadMessages] = useState([]);

  // Context Panel States
  const [activeMeds, setActiveMeds] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);

  // Group flat message history into sessions/threads (10 minutes inactivity gap)
  const groupMessagesIntoThreads = (allMsgs) => {
    const grouped = [];
    let currentThread = null;

    allMsgs.forEach((msg) => {
      const msgTime = new Date(msg.timestamp).getTime();
      
      if (msg.role === "user") {
        const timeGap = currentThread 
          ? msgTime - new Date(currentThread.messages[currentThread.messages.length - 1].timestamp).getTime()
          : Infinity;
          
        if (!currentThread || timeGap > 10 * 60 * 1000) {
          const words = msg.content.split(/\s+/).slice(0, 3).join(" ");
          const title = words.length > 20 ? words.slice(0, 20) + "..." : words || "Query log";
          currentThread = {
            id: msg.id || Math.random().toString(),
            title: title + (msg.content.split(/\s+/).length > 3 ? "..." : ""),
            messages: [msg],
          };
          grouped.push(currentThread);
        } else {
          currentThread.messages.push(msg);
        }
      } else {
        if (currentThread) {
          currentThread.messages.push(msg);
        }
      }
    });
    return grouped;
  };

  // Fetch Chat History & Context
  const loadChatAndContext = async () => {
    try {
      const [historyData, medsData, symptomsData] = await Promise.all([
        chatApi.getHistory(),
        medicationApi.getActive(),
        symptomApi.getHistory(),
      ]);
      
      const parsedThreads = groupMessagesIntoThreads(historyData || []);
      setThreads(parsedThreads);
      
      // Default to empty active chat view
      setActiveThreadId(null);
      setCurrentThreadMessages([]);
      
      setActiveMeds(medsData || []);
      setSymptomLogs(symptomsData || []);
    } catch {
      toast.error("Failed to load clinical assistant records.");
    } finally {
      setLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  useEffect(() => {
    loadChatAndContext();
  }, []);

  const handleSelectThread = (threadId) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setActiveThreadId(threadId);
      setCurrentThreadMessages(thread.messages);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleStartNewChat = () => {
    setActiveThreadId(null);
    setCurrentThreadMessages([]);
  };

  const handleSendMessage = async (textToSend) => {
    const msg = textToSend.trim();
    if (!msg) return;

    setChatMsg("");
    setChatLoading(true);

    const tempUserMsg = {
      id: Math.random().toString(),
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    
    // Optimistically update active message screen
    setCurrentThreadMessages((prev) => [...prev, tempUserMsg]);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const response = await chatApi.sendMessage(msg);
      
      // Update active thread message state
      setCurrentThreadMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        tempUserMsg,
        response,
      ]);

      // Refresh threads list mapping
      const updatedUserMsg = { ...tempUserMsg, id: response.id || tempUserMsg.id };
      
      if (!activeThreadId) {
        // Create new client thread
        const words = msg.split(/\s+/).slice(0, 3).join(" ");
        const title = (words.length > 20 ? words.slice(0, 20) + "..." : words) + (msg.split(/\s+/).length > 3 ? "..." : "");
        const newThread = {
          id: Math.random().toString(),
          title,
          messages: [updatedUserMsg, response],
        };
        setThreads((prev) => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
      } else {
        // Update active thread
        setThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, messages: [...t.messages, updatedUserMsg, response] }
              : t
          )
        );
      }
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast.error(err.message || "Failed to deliver chat query.");
      setCurrentThreadMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your AI medical consultation history?")) return;
    try {
      await chatApi.clearHistory();
      setThreads([]);
      setActiveThreadId(null);
      setCurrentThreadMessages([]);
      toast.success("Consultation history cleared.");
    } catch {
      toast.error("Failed to clear chat history.");
    }
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase block">
          CLINICAL BRAIN
        </span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink leading-none">
          AI Health Chat
        </h1>
        <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
          Ask clinical questions. The AI uses your age, active medication charts, latest blood metrics, and recent symptom logs to offer tailored guidance.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader label="Synchronizing clinical conversation records..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Chat Area (Col span 9) */}
          <div className="lg:col-span-9 flex flex-col space-y-4">
            
            {/* Active Discussion Viewport Box */}
            <div className="flex flex-col h-[460px] bg-cream-light/30 border border-stone-line/60 rounded-2xl overflow-hidden p-4 space-y-4">
              
              {/* Header inside chat box */}
              <div className="flex items-center justify-between border-b border-stone-line/40 pb-2 flex-shrink-0">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-stone" />
                  {activeThreadId ? "Active Discussion" : "New Consultation"}
                </span>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartNewChat}
                    className="text-[9px] font-mono-accent tracking-widest text-forest hover:text-forest-dark uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New Consult
                  </button>
                  <span className="text-stone-line">|</span>
                  <button
                    onClick={handleClearHistory}
                    disabled={threads.length === 0}
                    className="text-[9px] font-mono-accent tracking-widest text-stone hover:text-rose-500 uppercase disabled:opacity-40"
                  >
                    Clear History
                  </button>
                </div>
              </div>

              {/* Chat Speech Bubbles viewport */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar min-h-[220px]">
                {currentThreadMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <p className="font-sans text-[11px] text-stone leading-relaxed max-w-[240px]">
                      Consultation window clean. Type a custom health query or click a suggestion below to begin.
                    </p>
                  </div>
                ) : (
                  currentThreadMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[85%] ${
                        m.role === "user" ? "self-end items-end ml-auto" : "self-start items-start mr-auto"
                      }`}
                    >
                      <span className="font-mono-accent text-[8px] tracking-wider text-stone mb-0.5 uppercase">
                        {m.role === "user" ? "YOU" : "MEDIX AI"}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed shadow-sm ${
                          m.role === "user"
                            ? "bg-ink text-cream rounded-tr-none"
                            : "bg-cream border border-stone-line/50 text-ink-soft rounded-tl-none"
                        }`}
                      >
                        {formatChatMessage(m.content)}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="self-start flex flex-col max-w-[85%]">
                    <span className="font-mono-accent text-[8px] tracking-wider text-stone mb-0.5 uppercase">
                      MEDIX AI
                    </span>
                    <div className="px-4 py-2.5 bg-cream border border-stone-line/50 text-stone rounded-2xl rounded-tl-none text-xs font-sans italic animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chips suggestions */}
              {currentThreadMessages.length === 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-line/30 flex-shrink-0">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="text-[9px] font-sans bg-cream-light/60 border border-stone-line/55 hover:border-forest hover:text-forest transition-colors rounded-full px-2.5 py-1 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(chatMsg);
                }}
                className="flex gap-2 border-t border-stone-line/40 pt-3 flex-shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask clinical health questions..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 bg-cream border border-stone-line/60 rounded-full px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatMsg.trim()}
                  className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-forest disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Bottom History Strip */}
            {threads.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone" /> PAST CONVERSATIONS
                </span>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar scrollbar-thin">
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectThread(t.id)}
                      className={`text-[10px] font-sans border rounded-full px-3 py-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                        activeThreadId === t.id
                          ? "bg-forest/15 text-forest border-forest/30 font-medium"
                          : "bg-cream-light/40 border-stone-line/50 text-ink-soft hover:border-ink hover:text-ink"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column: Context Panel (Col span 3) */}
          <div className="lg:col-span-3 flex flex-col h-[460px] bg-cream-light/20 border border-stone-line/60 rounded-2xl p-4 space-y-4">
            <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block flex items-center gap-1.5 border-b border-stone-line/40 pb-2 flex-shrink-0">
              <Cpu className="w-3.5 h-3.5 text-forest" /> Active Context
            </span>

            <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
              {/* Demographics Bullets */}
              {user && (
                <div className="space-y-1">
                  <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                    Patient Metrics
                  </span>
                  <ul className="space-y-1 text-xs text-ink-soft list-disc list-inside">
                    <li>Name: <span className="text-ink font-semibold">{user.name}</span></li>
                    <li>Blood Group: <span className="text-ink font-semibold">{user.bloodGroup || "O+"}</span></li>
                    <li>DOB: <span className="text-ink font-semibold">{user.dateOfBirth || "N/A"}</span></li>
                  </ul>
                </div>
              )}

              {/* Medication Bullets */}
              <div className="space-y-1">
                <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                  Active Medications ({activeMeds.length})
                </span>
                {activeMeds.length === 0 ? (
                  <p className="text-[10px] text-stone italic pl-2">No active prescriptions</p>
                ) : (
                  <ul className="space-y-1 text-xs text-ink-soft list-disc list-inside">
                    {activeMeds.map((med) => (
                      <li key={med.id} className="truncate">
                        <span className="text-ink font-semibold">{med.name}</span> ({med.dosage})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Symptom Bullets */}
              <div className="space-y-1">
                <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                  Recent Symptom Logs ({symptomLogs.length})
                </span>
                {symptomLogs.length === 0 ? (
                  <p className="text-[10px] text-stone italic pl-2">No symptoms triage logs</p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-ink-soft list-disc list-inside">
                    {symptomLogs.slice(0, 3).map((log) => (
                      <li key={log.id} className="leading-snug">
                        <span className="text-ink font-semibold">{log.symptoms?.join(", ")}</span>
                        <span className={`ml-1.5 text-[8px] font-mono-accent uppercase font-bold ${
                          log.severity === "URGENT" || log.severity === "HIGH" ? "text-rose-500" : "text-stone"
                        }`}>
                          [{log.severity}]
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
