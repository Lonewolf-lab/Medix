import { useState, useEffect } from "react";
import { symptomApi } from "@/api/symptomApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import AIResponseStatusToast from "@/components/common/AIResponseStatusToast";
import toast from "react-hot-toast";
import {
  Activity,
  Plus,
  X,
  Clock,
  ChevronRight,
  AlertTriangle,
  HeartHandshake,
} from "lucide-react";

const POPULAR_SYMPTOMS = {
  General: ["Fever", "Fatigue", "Chills", "Dizziness", "Loss of appetite"],
  Respiratory: ["Cough", "Shortness of breath", "Sore throat", "Runny nose", "Congestion"],
  Digestive: ["Nausea", "Vomiting", "Stomach ache", "Diarrhea", "Acid reflux"],
  "Muscle / Body": ["Headache", "Body aches", "Joint pain", "Chest tightness", "Back pain"],
};

export default function SymptomCheckerPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);

  // Fetch symptom check history on load
  const fetchHistory = async () => {
    try {
      const data = await symptomApi.getHistory();
      setHistory(data.reverse());
    } catch (err) {
      toast.error("Failed to fetch history logs.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms((prev) => [...prev, symptom]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customSymptom.trim();
    if (!trimmed) return;
    if (selectedSymptoms.includes(trimmed)) {
      toast.error("Symptom already selected.");
      return;
    }
    setSelectedSymptoms((prev) => [...prev, trimmed]);
    setCustomSymptom("");
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select or type at least one symptom.");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await symptomApi.analyze({
        symptoms: selectedSymptoms,
        additionalNotes: notes || null,
      });
      setResult(response);
      toast.success("Analysis report generated successfully!");
      setSelectedSymptoms([]);
      setNotes("");
      fetchHistory();
    } catch (err) {
      toast.error(err.message || "Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyle = (severity) => {
    const s = severity?.toUpperCase();
    if (s === "LOW") return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    if (s === "MEDIUM") return "bg-amber-500/10 text-amber-600 border-amber-200";
    if (s === "HIGH" || s === "URGENT") return "bg-rose-500/10 text-rose-600 border-rose-200 animate-pulse";
    return "bg-stone-line/20 text-stone border-stone-line/60";
  };

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-10 max-w-5xl mx-auto space-y-10 sm:space-y-16 pb-24 sm:pb-10">
      {/* 1. Main Symptom Checker Form */}
      <div className="space-y-6 sm:space-y-10">
        {/* Header Block */}
        <div className="space-y-1.5 sm:space-y-2">
          <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-stone uppercase block">
            TRIAGE PORTAL
          </span>
          <h1 className="font-display text-2xl sm:text-4xl uppercase tracking-tight text-ink leading-tight sm:leading-none">
            Symptom Checker
          </h1>
          <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
            Select matching metrics, input severity indicators, and generate an AI-powered diagnostic first opinion.
          </p>
        </div>

        {loading ? (
          <div className="py-16 sm:py-24 flex items-center justify-center">
            <Loader label="AI is generating triage report..." />
          </div>
        ) : result ? (
          /* Results View */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-line/60 pb-4 gap-3">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="font-mono-accent text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] text-stone">REPORT GENERATED</span>
                <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wider text-ink leading-tight sm:leading-none">Triage Summary</h3>
              </div>
              <div className={`self-start sm:self-auto px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border text-[9px] sm:text-[10px] font-mono-accent tracking-widest ${getSeverityStyle(result.severity)}`}>
                {result.severity?.toUpperCase()} SEVERITY
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-start">
              {/* Left Column: Causes */}
              <div className="space-y-2.5 sm:space-y-3">
                <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] text-stone uppercase block">POSSIBLE CAUSES</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {result.possibleCauses?.map((cause) => (
                    <span
                      key={cause}
                      className="px-3 py-1 sm:px-3.5 sm:py-1.5 bg-cream-light border border-stone-line/60 rounded-full text-xs font-sans text-ink"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Recommendations */}
              <div className="space-y-2.5 sm:space-y-3">
                <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] text-stone uppercase block">RECOMMENDED ACTION</span>
                <p className="font-sans text-xs text-ink-soft leading-relaxed bg-cream-light border border-stone-line/40 rounded-xl p-3.5 sm:p-4">
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2.5 sm:gap-3 bg-amber-500/5 border border-amber-200/50 rounded-xl p-3.5 sm:p-4 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
              <p className="font-sans leading-relaxed text-[11px] sm:text-xs">{result.disclaimer}</p>
            </div>

            <div className="flex sm:justify-end pt-2 border-t border-stone-line/60">
              <button
                onClick={() => setResult(null)}
                className="w-full sm:w-auto font-mono-accent text-xs tracking-[0.15em] bg-ink text-cream px-6 py-3 rounded-full hover:bg-forest transition-all duration-300 active:scale-98 sm:hover:scale-105 text-center"
              >
                NEW ASSESSMENT
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form Builder */
          <div className="space-y-6 sm:space-y-8">
            {/* 01 — Select Symptoms */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-stone uppercase block">
                  01 — SELECT SYMPTOMS
                </span>
                <span className="md:hidden font-mono-accent text-[9px] tracking-wider text-stone/80">
                  Swipe cards →
                </span>
              </div>
              
              {/* Mobile Carousel View (< md) */}
              <div className="md:hidden flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
                {Object.entries(POPULAR_SYMPTOMS).map(([category, items]) => {
                  const selectedCount = items.filter((item) => selectedSymptoms.includes(item)).length;
                  return (
                    <div
                      key={category}
                      className="w-[260px] shrink-0 snap-start bg-cream-light/70 border border-stone-line/60 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-stone-line/50 pb-1.5">
                        <span className="font-mono-accent text-[10px] tracking-widest text-ink uppercase font-semibold">
                          {category}
                        </span>
                        {selectedCount > 0 && (
                          <span className="font-mono-accent text-[9px] px-2 py-0.5 rounded-full bg-forest text-cream-light font-medium">
                            {selectedCount} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((symptom) => {
                          const selected = selectedSymptoms.includes(symptom);
                          return (
                            <button
                              key={symptom}
                              onClick={() => toggleSymptom(symptom)}
                              className={`px-2.5 py-1 rounded-full border text-[11px] tracking-wide transition-all duration-200 active:scale-95 ${
                                selected
                                  ? "bg-forest border-forest text-cream-light font-medium"
                                  : "bg-cream/80 border-stone-line/60 text-ink hover:border-stone"
                              }`}
                            >
                              {symptom}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Grid View (>= md) */}
              <div className="hidden md:grid md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(POPULAR_SYMPTOMS).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase block border-b border-stone-line/60 pb-1">
                      {category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((symptom) => {
                        const selected = selectedSymptoms.includes(symptom);
                        return (
                          <button
                            key={symptom}
                            onClick={() => toggleSymptom(symptom)}
                            className={`px-3 py-1.5 rounded-full border text-xs tracking-wide transition-all duration-300 ${
                              selected
                                ? "bg-forest border-forest text-cream-light font-medium"
                                : "bg-transparent border-stone-line/60 text-ink hover:border-stone"
                            }`}
                          >
                            {symptom}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 pt-2 sm:pt-4">
              {/* Custom Input */}
              <div className="space-y-3 sm:space-y-4">
                <form onSubmit={handleAddCustom} className="space-y-2">
                  <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-stone uppercase block">
                    02 — ADD CUSTOM SYMPTOM
                  </span>
                  <div className="flex gap-2 border-b border-stone-line/60 focus-within:border-forest transition-colors py-1.5 sm:py-1">
                    <input
                      type="text"
                      placeholder="Type symptom and press enter..."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      className="flex-1 bg-transparent px-1 text-xs text-ink focus:outline-none placeholder:text-stone/60"
                    />
                    <button
                      type="submit"
                      className="p-1.5 sm:p-1 text-stone hover:text-forest transition-colors active:scale-95"
                      aria-label="Add custom symptom"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {selectedSymptoms.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-accent text-[9px] tracking-[0.2em] text-stone uppercase block">
                        Active Selection ({selectedSymptoms.length})
                      </span>
                      <button
                        onClick={() => setSelectedSymptoms([])}
                        className="font-mono-accent text-[9px] text-rose-600/80 hover:text-rose-600 transition-colors uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>
                    {/* Mobile scrollable chip row / Desktop wrap */}
                    <div className="flex overflow-x-auto sm:flex-wrap gap-1.5 pb-1 sm:pb-0 scrollbar-none">
                      {selectedSymptoms.map((s) => (
                        <span
                          key={s}
                          className="shrink-0 sm:shrink inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-forest/10 border border-forest/20 rounded-full text-[11px] sm:text-xs font-sans text-forest"
                        >
                          {s}
                          <button onClick={() => toggleSymptom(s)} aria-label={`Remove ${s}`} className="p-0.5 hover:text-rose-500">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-stone uppercase block">
                  03 — ADDITIONAL DETAILS (OPTIONAL)
                </span>
                <textarea
                  placeholder="Notes about onset, triggers, or severity logs..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1.5 sm:py-2 text-xs text-ink resize-none h-[54px] sm:h-[65px] transition-colors placeholder:text-stone/60"
                />
              </div>
            </div>

            {/* Actions Button (Full width on mobile, centered pill on desktop) */}
            <div className="flex justify-center pt-2 sm:pt-4">
              <button
                onClick={handleAnalyze}
                disabled={selectedSymptoms.length === 0}
                className="w-full sm:w-auto font-mono-accent text-[11px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] bg-ink text-cream px-6 sm:px-8 py-3.5 rounded-full hover:bg-forest disabled:opacity-50 disabled:hover:bg-ink transition-all duration-300 active:scale-98 sm:hover:scale-105 flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                GENERATE ASSESSMENT REPORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. History Section */}
      <div className="border-t border-stone-line/60 pt-6 sm:pt-10 space-y-4 sm:space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-stone">HISTORY ARCHIVE</span>
            <h3 className="font-display text-lg sm:text-xl uppercase tracking-wider text-ink">Triage Logs</h3>
          </div>
          <span className="hidden sm:inline font-mono-accent text-[10px] tracking-[0.2em] text-stone">PAST RECORDS</span>
          <span className="sm:hidden font-mono-accent text-[9px] tracking-wider text-stone/80">Swipe →</span>
        </div>

        {historyLoading ? (
          <div className="py-8 sm:py-10 text-center font-mono-accent text-xs text-stone">Loading history logs...</div>
        ) : history.length === 0 ? (
          <div className="py-8 sm:py-10 text-center font-mono-accent text-xs text-stone border border-dashed border-stone-line/60 rounded-xl">
            No past logs found.
          </div>
        ) : (
          <>
            {/* Mobile Carousel (< md) */}
            <div className="md:hidden flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-none">
              {history.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setViewingLog(log)}
                  className="w-[230px] shrink-0 snap-start bg-cream-light/70 border border-stone-line/60 rounded-xl p-3.5 flex flex-col justify-between text-left active:scale-[0.98] transition-transform space-y-2.5 group"
                >
                  <div className="space-y-1 w-full">
                    <span className="font-mono-accent text-[8.5px] tracking-wide text-stone block">
                      {new Date(log.timestamp).toLocaleDateString()} — {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="font-sans text-xs text-ink font-semibold truncate group-hover:text-forest transition-colors">
                      {log.symptoms?.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full pt-1 border-t border-stone-line/40">
                    <span className={`inline-block text-[8.5px] font-mono-accent tracking-widest border px-2 py-0.5 rounded-full ${getSeverityStyle(log.severity)}`}>
                      {log.severity?.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono-accent text-stone flex items-center gap-0.5">
                      View <ChevronRight className="w-3.5 h-3.5 text-stone" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop Grid (>= md) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {history.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setViewingLog(log)}
                  className="text-left bg-transparent border-b border-stone-line/60 hover:border-forest pb-4 transition-all duration-300 flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <span className="font-mono-accent text-[9px] tracking-wide text-stone block">
                      {new Date(log.timestamp).toLocaleDateString()} — {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="font-sans text-xs text-ink font-semibold truncate group-hover:text-forest transition-colors">
                      {log.symptoms?.join(", ")}
                    </p>
                    <span className={`inline-block text-[9px] font-mono-accent tracking-widest border px-2 py-0.5 rounded-full ${getSeverityStyle(log.severity)}`}>
                      {log.severity?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {viewingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingLog(null)}
              className="fixed inset-0 bg-ink"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream border border-stone-line max-w-lg w-full rounded-2xl p-4 sm:p-6 relative z-10 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-3 sm:pb-4">
                <div className="space-y-0.5">
                  <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase">
                    LOGGED ON {new Date(viewingLog.timestamp).toLocaleString()}
                  </span>
                  <h4 className="font-display text-base sm:text-lg uppercase tracking-wider text-ink">LOGGED ASSESSMENT</h4>
                </div>
                <button
                  onClick={() => setViewingLog(null)}
                  className="p-1.5 sm:p-2 hover:bg-stone-line/20 rounded-lg text-ink"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase block">SYMPTOMS</span>
                  <p className="font-sans text-xs text-ink font-medium bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg">
                    {viewingLog.symptoms?.join(", ")}
                  </p>
                </div>

                {viewingLog.additionalNotes && (
                  <div className="space-y-1">
                    <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase block">ADDITIONAL DETAILS</span>
                    <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg leading-relaxed">
                      {viewingLog.additionalNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase block">SEVERITY LEVEL</span>
                    <div className={`text-center py-2 sm:py-2.5 rounded-lg border text-[11px] sm:text-xs font-mono-accent tracking-widest ${getSeverityStyle(viewingLog.severity)}`}>
                      {viewingLog.severity?.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase block">POSSIBLE CAUSES</span>
                    <div className="flex flex-wrap gap-1">
                      {viewingLog.possibleCauses?.map((cause) => (
                        <span
                          key={cause}
                          className="px-2 py-0.5 sm:py-1 bg-cream-light border border-stone-line/60 rounded text-[9.5px] sm:text-[10px] font-sans text-ink truncate max-w-full"
                          title={cause}
                        >
                          {cause}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-mono-accent text-[8.5px] sm:text-[9px] tracking-widest text-stone uppercase block">RECOMMENDATION</span>
                  <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 p-2.5 sm:p-3 rounded-lg leading-relaxed">
                    {viewingLog.recommendation || viewingLog.triageResult}
                  </p>
                </div>

                <div className="flex gap-2 sm:gap-2.5 bg-stone-line/20 border border-stone-line/60 rounded-lg p-2.5 sm:p-3 text-[9.5px] sm:text-[10px] text-stone">
                  <HeartHandshake className="w-4 h-4 flex-shrink-0 text-stone mt-0.5 sm:mt-0" />
                  <p className="font-sans leading-relaxed">
                    This report is powered by AI for informational purposes only. Do not ignore professional advice.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AIResponseStatusToast active={loading} message="Evaluating symptom pattern & generating triage analysis..." />
    </div>
  );
}
