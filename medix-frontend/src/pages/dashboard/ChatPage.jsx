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
  Trash2,
  Cpu,
  User,
  ShieldAlert,
  Sparkles,
  Pill,
  Activity,
  Heart,
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
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Context Panel States
  const [activeMeds, setActiveMeds] = useState([]);
  const [symptomLogs, setSymptomLogs] = useState([]);
  const [contextLoading, setContextLoading] = useState(true);

  // Fetch Chat History & Context
  const loadChatAndContext = async () => {
    try {
      const [historyData, medsData, symptomsData] = await Promise.all([
        chatApi.getHistory(),
        medicationApi.getActive(),
        symptomApi.getHistory(),
      ]);
      setMessages(historyData || []);
      setActiveMeds(medsData || []);
      setSymptomLogs(symptomsData || []);
    } catch {
      toast.error("Failed to load clinical assistant records.");
    } finally {
      setLoading(false);
      setContextLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  useEffect(() => {
    loadChatAndContext();
  }, []);

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
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const response = await chatApi.sendMessage(msg);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, response]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast.error(err.message || "Failed to deliver chat query.");
      // Rollback user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your AI medical consultation history?")) return;
    try {
      await chatApi.clearHistory();
      setMessages([]);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Panel: Chat Portal (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col max-h-[560px] bg-cream-light/30 border border-stone-line/60 rounded-2xl overflow-hidden p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-line/40 pb-2 flex-shrink-0">
              <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-forest" /> CONTEXT-AWARE ASSISTANT
              </span>
              <button
                onClick={handleClearHistory}
                disabled={messages.length === 0}
                className="text-[9px] font-mono-accent tracking-widest text-stone hover:text-rose-500 uppercase disabled:opacity-40"
              >
                Wipe Records
              </button>
            </div>

            {/* Chat Viewport */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar min-h-[300px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="w-6 h-6 text-stone mb-2" />
                  <p className="font-sans text-[11px] text-stone leading-relaxed max-w-[240px]">
                    No messages recorded. Select a suggestion chip below or type a query to consult with Medix.
                  </p>
                </div>
              ) : (
                messages.map((m) => (
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
                      className={`px-3 py-2 rounded-xl text-xs font-sans leading-relaxed ${
                        m.role === "user"
                          ? "bg-ink text-cream"
                          : "bg-cream border border-stone-line/40 text-ink-soft"
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
                  <span className="text-xs font-sans text-stone italic animate-pulse">Thinking...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-line/30 flex-shrink-0">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-[10px] font-sans bg-cream-light/60 border border-stone-line/50 hover:border-forest hover:text-forest transition-colors rounded-full px-3 py-1 cursor-pointer"
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
                placeholder="Ask about medications, blood levels, symptom warnings..."
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                disabled={chatLoading}
                className="flex-1 bg-cream border border-stone-line/60 rounded-full px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatMsg.trim()}
                className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-forest disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Panel: Clinical Context (Col span 4) */}
          <div className="lg:col-span-4 bg-cream-light/40 border border-stone-line/60 rounded-2xl p-4 space-y-4">
            <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block flex items-center gap-1.5 border-b border-stone-line/40 pb-2">
              <Cpu className="w-3.5 h-3.5 text-forest" /> AI INJECTED CONTEXT
            </span>

            {/* Profile Context */}
            {user && (
              <div className="space-y-1 text-xs">
                <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                  Demographics
                </span>
                <div className="bg-cream p-2.5 rounded-lg border border-stone-line/40 space-y-1">
                  <p className="font-sans text-[11px] text-ink font-semibold flex justify-between">
                    <span>Patient Name:</span>
                    <span className="text-ink-soft font-normal">{user.name}</span>
                  </p>
                  <p className="font-sans text-[11px] text-ink font-semibold flex justify-between">
                    <span>Blood Group:</span>
                    <span className="text-ink-soft font-normal">{user.bloodGroup || "O+"}</span>
                  </p>
                  <p className="font-sans text-[11px] text-ink font-semibold flex justify-between">
                    <span>Date of Birth:</span>
                    <span className="text-ink-soft font-normal">{user.dateOfBirth || "N/A"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Medications Context */}
            <div className="space-y-1 text-xs">
              <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                Active Medications ({activeMeds.length})
              </span>
              <div className="bg-cream p-2.5 rounded-lg border border-stone-line/40 max-h-[140px] overflow-y-auto custom-scrollbar space-y-1.5">
                {activeMeds.length === 0 ? (
                  <p className="text-[10px] text-stone italic">No active prescriptions</p>
                ) : (
                  activeMeds.map((med) => (
                    <div key={med.id} className="flex gap-1.5 items-start border-b border-stone-line/10 pb-1 last:border-none last:pb-0">
                      <Pill className="w-3 h-3 text-forest mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-ink">{med.name} ({med.dosage})</p>
                        <p className="text-[8px] font-mono-accent text-stone uppercase">{med.frequency}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Symptoms Triage Context */}
            <div className="space-y-1 text-xs">
              <span className="font-mono-accent text-[8px] tracking-wider text-stone uppercase block">
                Recent Triage Checks ({symptomLogs.length})
              </span>
              <div className="bg-cream p-2.5 rounded-lg border border-stone-line/40 max-h-[140px] overflow-y-auto custom-scrollbar space-y-1.5">
                {symptomLogs.length === 0 ? (
                  <p className="text-[10px] text-stone italic">No symptoms triage logs</p>
                ) : (
                  symptomLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex gap-1.5 items-start border-b border-stone-line/10 pb-1.5 last:border-none last:pb-0">
                      <Activity className="w-3 h-3 text-stone mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-ink truncate max-w-[160px]">{log.symptoms?.join(", ")}</p>
                        <p className="text-[8px] font-mono-accent text-stone uppercase flex gap-1.5">
                          <span>Severity:</span>
                          <span className={
                            log.severity === "URGENT" || log.severity === "HIGH" ? "text-rose-500 font-bold" : "text-stone"
                          }>
                            {log.severity}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
