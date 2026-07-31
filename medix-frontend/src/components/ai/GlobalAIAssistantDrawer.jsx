import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { schedulerApi } from "@/api/schedulerApi";
import { chatApi } from "@/api/chatApi";
import toast from "react-hot-toast";
import {
  Bot,
  X,
  Send,
  Calendar,
  Pill,
  Clock,
  Sparkles, // note: we won't render sparkles emojis or sparkles icon in UI to follow workspace rules, using clean icons
  Stethoscope,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

const SUGGESTION_PROMPTS = [
  "Meet with Dr. Sharma on July 30 at 11:30 AM",
  "Add a medicine reminder for Glycomet fort at 10 AM and 7 PM for 3 weeks",
  "Schedule doctor appointment with Dr. Gupta next Monday at 4 PM",
];

export default function GlobalAIAssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your Medix AI Assistant. You can ask clinical health questions or dictate calendar schedules & medication reminders directly in natural language.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeBiomarkers, setActiveBiomarkers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading]);

  useEffect(() => {
    const handleBiosUpdate = (e) => {
      setActiveBiomarkers(e.detail || []);
    };
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("medix:active-biomarkers", handleBiosUpdate);
    window.addEventListener("medix:open-ai-assistant", handleOpen);
    return () => {
      window.removeEventListener("medix:active-biomarkers", handleBiosUpdate);
      window.removeEventListener("medix:open-ai-assistant", handleOpen);
    };
  }, []);

  const handleRemoveBio = (paramName) => {
    window.dispatchEvent(new CustomEvent("medix:deselect-biomarker", {
      detail: paramName
    }));
  };

  const handleSend = async (promptText) => {
    const text = (promptText || inputMsg).trim();
    if (!text || loading) return;

    setInputMsg("");
    setLoading(true);

    const userMsg = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      let textToSend = text;
      if (activeBiomarkers.length > 0) {
        const contextStr = activeBiomarkers
          .map((b) => `${b.parameter}: ${b.value} ${b.unit} (${b.status})`)
          .join(", ");
        textToSend = `[Biomarker Context: ${contextStr}] ${text}`;
      }

      // First try executing scheduler agent
      const res = await schedulerApi.executePrompt(textToSend);

      if (res && res.intentType && res.intentType !== "UNKNOWN") {
        // AI recognized an appointment or medication schedule intent!
        const assistantMsg = {
          id: Math.random().toString(),
          role: "assistant",
          content: res.message,
          actionCard: res,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Notify active pages to reload calendar / medications data
        window.dispatchEvent(new Event("medix:schedule-updated"));
        let successMsg = "Schedule updated!";
        const it = res.intentType;
        if (it === "CREATE_APPOINTMENT" || it === "APPOINTMENT") {
          successMsg = "Doctor visit scheduled!";
        } else if (it === "CREATE_MEDICATION" || it === "MEDICATION") {
          successMsg = "Medication reminder added!";
        } else if (it === "DELETE_MEDICATION") {
          successMsg = "Medication removed!";
        } else if (it === "DELETE_APPOINTMENT") {
          successMsg = "Appointment cancelled!";
        } else if (it === "EDIT_MEDICATION_TIMINGS") {
          successMsg = "Medication timings updated!";
        }
        toast.success(successMsg);
      } else {
        try {
          // Fallback to contextual chat assistant for general Q&A
          const chatRes = await chatApi.sendMessage(textToSend);
          const assistantMsg = {
            id: Math.random().toString(),
            role: "assistant",
            content: chatRes?.content || res?.message || "I couldn't clarify a specific appointment or medication schedule. Try saying: 'Meet Dr. Sharma on July 30 at 11:30 AM' or 'Add Glycomet fort at 10 AM for 3 weeks'.",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } catch (chatErr) {
          const assistantMsg = {
            id: Math.random().toString(),
            role: "assistant",
            content: res?.message || "I couldn't clarify a specific appointment or medication schedule. Try saying: 'Meet Dr. Sharma on July 30 at 11:30 AM' or 'Add Glycomet fort at 10 AM for 3 weeks'.",
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to process request.");
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content:
            "I encountered an issue processing that prompt. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right - Every Page) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 bg-ink hover:bg-forest text-cream flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Slide-over Drawer (Every Page) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-ink/60 backdrop-blur-xs z-50"
            />

            {/* Right Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-cream-light border-l border-stone-line shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-stone-line bg-cream flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-forest/15 border border-forest/30 flex items-center justify-center text-forest">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-wide text-ink">
                      Medix AI Assistant
                    </h3>
                    <span className="font-mono-accent text-[9px] text-forest uppercase tracking-widest block">
                      Universal Assistant & Scheduler
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full border border-stone-line/60 hover:bg-stone-line/30 transition-colors text-ink cursor-pointer"
                  aria-label="Close AI Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Viewport Area */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[88%] ${
                      m.role === "user"
                        ? "self-end items-end ml-auto"
                        : "self-start items-start mr-auto"
                    }`}
                  >
                    <span className="font-mono-accent text-[8px] tracking-wider text-stone mb-1 uppercase">
                      {m.role === "user" ? "YOU" : "MEDIX AI"}
                    </span>
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs font-sans leading-relaxed shadow-xs ${
                        m.role === "user"
                          ? "bg-ink text-cream rounded-tr-none"
                          : "bg-cream border border-stone-line/70 text-ink rounded-tl-none"
                      }`}
                    >
                      {m.role === "user" ? m.content : <FormattedMessage content={m.content} />}
                    </div>

                    {/* Action Confirmation Card Object */}
                    {m.actionCard && (m.actionCard.createdAppointment || m.actionCard.createdMedication) && (
                      <div className="mt-2.5 w-full bg-cream border border-forest/40 rounded-xl p-3.5 space-y-2 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 text-forest font-mono-accent text-[10px] tracking-wider uppercase font-bold">
                          {m.actionCard.createdAppointment ? (
                            <>
                              <Stethoscope className="w-3.5 h-3.5" /> Doctor Visit Scheduled
                            </>
                          ) : (
                            <>
                              <Pill className="w-3.5 h-3.5" /> {m.actionCard.intentType === "EDIT_MEDICATION_TIMINGS" ? "Medication Timings Updated" : "Medication Reminder Added"}
                            </>
                          )}
                        </div>

                        {m.actionCard.createdAppointment && (
                          <div className="text-xs font-sans text-ink space-y-0.5 pt-1 border-t border-stone-line/40">
                            <p className="font-bold">
                              {m.actionCard.createdAppointment.doctorName}
                            </p>
                            <p className="text-[11px] text-stone">
                              {m.actionCard.createdAppointment.specialty}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] font-mono-accent text-forest pt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(
                                m.actionCard.createdAppointment.appointmentTime
                              ).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </div>
                          </div>
                        )}

                        {m.actionCard.createdMedication && (
                          <div className="text-xs font-sans text-ink space-y-0.5 pt-1 border-t border-stone-line/40">
                            <p className="font-bold">
                              {m.actionCard.createdMedication.name} ({m.actionCard.createdMedication.dosage})
                            </p>
                            <p className="text-[11px] text-stone uppercase font-mono-accent">
                              {m.actionCard.createdMedication.frequency?.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] font-mono-accent text-forest pt-1">
                              <Clock className="w-3 h-3" />
                              Schedule: {m.actionCard.createdMedication.startDate} → {m.actionCard.createdMedication.endDate || "Ongoing"}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="self-start flex flex-col max-w-[85%]">
                    <span className="font-mono-accent text-[8px] tracking-wider text-stone mb-1 uppercase">
                      MEDIX AI
                    </span>
                    <div className="px-4 py-3 bg-cream border border-stone-line/60 text-stone rounded-2xl rounded-tl-none text-xs font-sans italic animate-pulse">
                      Analyzing scheduling intent & processing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Footer */}
              {!inputMsg.trim() && activeBiomarkers.length === 0 && messages.length === 1 && (
                <div className="px-4 py-3 border-t border-stone-line/50 bg-cream-light/80 flex-shrink-0">
                  <span className="font-mono-accent text-[9px] text-stone uppercase tracking-widest block mb-2">
                    Try AI Scheduling Prompts:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTION_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        disabled={loading}
                        className="text-left text-[10px] font-mono-accent text-ink-soft hover:text-forest bg-cream border border-stone-line/60 hover:border-forest px-2.5 py-1.5 rounded-lg transition-colors truncate flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{prompt}</span>
                        <ChevronRight className="w-3 h-3 text-stone shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Biomarker Context Chips */}
              {activeBiomarkers.length > 0 && (
                <div className="px-4 py-2.5 bg-cream-light border-t border-stone-line/45 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar flex-shrink-0">
                  <div className="w-full text-[8px] font-mono-accent text-stone uppercase tracking-widest mb-0.5">
                    Active Biomarker Context:
                  </div>
                  {activeBiomarkers.map((bio) => (
                    <div
                      key={bio.parameter}
                      className="bg-forest/10 border border-forest/20 text-forest text-[9px] font-mono-accent uppercase rounded-full px-2.5 py-0.5 flex items-center gap-1.5"
                    >
                      <span>{bio.parameter}: {bio.value} {bio.unit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBio(bio.parameter)}
                        className="hover:text-rose-500 font-bold focus:outline-none cursor-pointer text-xs leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-4 border-t border-stone-line bg-cream flex items-center gap-2 flex-shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask health Qs or schedule e.g. 'Meet Dr. Sharma tomorrow at 10 AM'..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-cream-light border border-stone-line/80 rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMsg.trim()}
                  className="w-9 h-9 rounded-xl bg-forest text-cream-light flex items-center justify-center hover:bg-forest-bright disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Beautified Markdown/Formatted Text Renderer for AI messages
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs font-sans leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        // Headers: ###, ##, #
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={lineIdx} className="font-display text-[13px] uppercase tracking-wide text-forest mt-3 mb-1.5">
              {parseBold(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const text = trimmed.startsWith("## ") ? trimmed.substring(3) : trimmed.substring(2);
          return (
            <h3 key={lineIdx} className="font-display text-sm uppercase tracking-wide text-ink mt-3.5 mb-2 border-b border-stone-line/45 pb-0.5">
              {parseBold(text)}
            </h3>
          );
        }

        // Bullet point: - or *
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1.5 mt-0.5">
              <span className="text-forest font-bold select-none">•</span>
              <span className="flex-1">{parseBold(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered list: 1. 2. etc.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1.5 mt-0.5">
              <span className="font-mono-accent text-[9px] text-stone mt-0.5 select-none">{numMatch[1]}.</span>
              <span className="flex-1">{parseBold(numMatch[2])}</span>
            </div>
          );
        }

        // Standard line
        return <p key={lineIdx}>{parseBold(trimmed)}</p>;
      })}
    </div>
  );
};

// Simple bold parser helper (**bold**)
const parseBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-ink bg-forest/10 px-1 rounded mx-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};
