import { useState, useEffect } from "react";
import { symptomApi } from "@/api/symptomApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
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
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-16">
      {/* 1. Main Symptom Checker Form */}
      <div className="space-y-10">
        {/* Header Block */}
        <div className="space-y-2">
          <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase block">
            TRIAGE PORTAL
          </span>
          <h1 className="font-display text-4xl uppercase tracking-tight text-ink leading-none">
            Symptom Checker
          </h1>
          <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
            Select matching metrics, input severity indicators, and generate an AI-powered diagnostic first opinion.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader label="AI is generating triage report..." />
          </div>
        ) : result ? (
          /* Results View */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between border-b border-stone-line/60 pb-4">
              <div className="space-y-1">
                <span className="font-mono-accent text-[9px] tracking-[0.3em] text-stone">REPORT GENERATED</span>
                <h3 className="font-display text-2xl uppercase tracking-wider text-ink leading-none">Triage Summary</h3>
              </div>
              <div className={`px-4 py-1.5 rounded-full border text-[10px] font-mono-accent tracking-widest ${getSeverityStyle(result.severity)}`}>
                {result.severity?.toUpperCase()} SEVERITY
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Causes */}
              <div className="space-y-3">
                <span className="font-mono-accent text-[10px] tracking-[0.2em] text-stone uppercase block">POSSIBLE CAUSES</span>
                <div className="flex flex-wrap gap-2">
                  {result.possibleCauses?.map((cause) => (
                    <span
                      key={cause}
                      className="px-3.5 py-1.5 bg-cream-light border border-stone-line/60 rounded-full text-xs font-sans text-ink"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Recommendations */}
              <div className="space-y-3">
                <span className="font-mono-accent text-[10px] tracking-[0.2em] text-stone uppercase block">RECOMMENDED ACTION</span>
                <p className="font-sans text-xs text-ink-soft leading-relaxed bg-cream-light border border-stone-line/40 rounded-xl p-4">
                  {result.recommendation}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-3 bg-amber-500/5 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <p className="font-sans leading-relaxed">{result.disclaimer}</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-line/60">
              <button
                onClick={() => setResult(null)}
                className="font-mono-accent text-xs tracking-[0.15em] bg-ink text-cream px-6 py-3 rounded-full hover:bg-forest transition-all duration-300 hover:scale-105"
              >
                NEW ASSESSMENT
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form Builder (Editorial, spaced out, max-width contained) */
          <div className="space-y-8">
            {/* Category Select Column Layout */}
            <div className="space-y-4">
              <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
                01 — SELECT SYMPTOMS
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              {/* Custom Input */}
              <div className="space-y-4">
                <form onSubmit={handleAddCustom} className="space-y-2">
                  <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
                    02 — ADD CUSTOM SYMPTOM
                  </span>
                  <div className="flex gap-2 border-b border-stone-line/60 focus-within:border-forest transition-colors py-1">
                    <input
                      type="text"
                      placeholder="Type symptom and press enter..."
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      className="flex-1 bg-transparent px-1 text-xs text-ink focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 text-stone hover:text-forest transition-colors"
                      aria-label="Add custom symptom"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {selectedSymptoms.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono-accent text-[9px] tracking-[0.2em] text-stone uppercase block">
                      Active Selection
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSymptoms.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest/10 border border-forest/20 rounded-full text-xs font-sans text-forest"
                        >
                          {s}
                          <button onClick={() => toggleSymptom(s)} aria-label={`Remove ${s}`}>
                            <X className="w-3 h-3 hover:text-rose-500" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
                  03 — ADDITIONAL DETAILS (OPTIONAL)
                </span>
                <textarea
                  placeholder="Notes about onset, triggers, or severity logs..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-2 text-xs text-ink resize-none h-[65px] transition-colors"
                />
              </div>
            </div>

            {/* Actions Button (Centered Pill) */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleAnalyze}
                disabled={selectedSymptoms.length === 0}
                className="font-mono-accent text-xs tracking-[0.2em] bg-ink text-cream px-8 py-3.5 rounded-full hover:bg-forest disabled:opacity-50 disabled:hover:bg-ink transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                GENERATE ASSESSMENT REPORT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. History Section (At the bottom, styled as horizontal cards) */}
      <div className="border-t border-stone-line/60 pt-10 space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">HISTORY ARCHIVE</span>
            <h3 className="font-display text-xl uppercase tracking-wider text-ink">Triage Logs</h3>
          </div>
          <span className="font-mono-accent text-[10px] tracking-[0.2em] text-stone">PAST RECORDS</span>
        </div>

        {historyLoading ? (
          <div className="py-10 text-center font-mono-accent text-xs text-stone">Loading history logs...</div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center font-mono-accent text-xs text-stone border border-dashed border-stone-line/60 rounded-xl">
            No past logs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        )}
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {viewingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
              className="bg-cream border border-stone-line max-w-lg w-full rounded-2xl p-6 relative z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-4">
                <div>
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">
                    LOGGED ON {new Date(viewingLog.timestamp).toLocaleString()}
                  </span>
                  <h4 className="font-display text-lg uppercase tracking-wider text-ink">LOGGED ASSESSMENT</h4>
                </div>
                <button
                  onClick={() => setViewingLog(null)}
                  className="p-2 hover:bg-stone-line/20 rounded-lg text-ink"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">SYMPTOMS</span>
                  <p className="font-sans text-xs text-ink font-medium bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg">
                    {viewingLog.symptoms?.join(", ")}
                  </p>
                </div>

                {viewingLog.additionalNotes && (
                  <div className="space-y-1.5">
                    <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">ADDITIONAL DETAILS</span>
                    <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg leading-relaxed">
                      {viewingLog.additionalNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">SEVERITY LEVEL</span>
                    <div className={`text-center py-2.5 rounded-lg border text-xs font-mono-accent tracking-widest ${getSeverityStyle(viewingLog.severity)}`}>
                      {viewingLog.severity?.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">POSSIBLE CAUSES</span>
                    <div className="flex flex-wrap gap-1">
                      {viewingLog.possibleCauses?.map((cause) => (
                        <span
                          key={cause}
                          className="px-2 py-1 bg-cream-light border border-stone-line/60 rounded text-[10px] font-sans text-ink truncate max-w-full"
                          title={cause}
                        >
                          {cause}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">RECOMMENDATION</span>
                  <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 p-3 rounded-lg leading-relaxed">
                    {viewingLog.recommendation || viewingLog.triageResult}
                  </p>
                </div>

                <div className="flex gap-2.5 bg-stone-line/20 border border-stone-line/60 rounded-lg p-3 text-[10px] text-stone">
                  <HeartHandshake className="w-4 h-4 flex-shrink-0 text-stone" />
                  <p className="font-sans leading-relaxed">
                    This report is powered by AI for informational purposes only. Do not ignore professional advice.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
