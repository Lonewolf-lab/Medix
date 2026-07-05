import { useState, useEffect } from "react";
import { symptomApi } from "@/api/symptomApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import {
  Activity,
  Plus,
  X,
  FileText,
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
      // Backend returns logs chronologically or reverse. Let's make sure it's newest first.
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
      // Reset form fields
      setSelectedSymptoms([]);
      setNotes("");
      // Refresh history log list
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
    <div className="p-6 space-y-10">
      {/* Page Header */}
      <div>
        <span className="font-mono-accent text-xs tracking-widest text-stone uppercase">TRIAGE PORTAL</span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink mt-1">Symptom Checker</h1>
        <p className="font-sans text-ink-soft max-w-xl text-sm leading-relaxed mt-2">
          Select your symptoms below, add additional details, and generate a medical AI assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Checker Panel */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="border border-stone-line/60 bg-cream-light/40 rounded-xl p-20 flex items-center justify-center min-h-[350px]">
              <Loader label="AI is analyzing your symptoms..." />
            </div>
          ) : result ? (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cream-light/60 border border-stone-line/60 rounded-xl p-6 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-line/60 pb-4">
                <div className="space-y-1">
                  <span className="font-mono-accent text-[10px] tracking-widest text-stone">TRIAGE COMPLETED</span>
                  <h3 className="font-display text-lg uppercase tracking-wider text-ink">Analysis Report</h3>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-mono-accent tracking-widest ${getSeverityStyle(result.severity)}`}>
                  {result.severity?.toUpperCase()} SEVERITY
                </div>
              </div>

              {/* Causes */}
              <div className="space-y-2">
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase">POSSIBLE CAUSES</span>
                <div className="flex flex-wrap gap-2">
                  {result.possibleCauses?.map((cause) => (
                    <span
                      key={cause}
                      className="px-3 py-1 bg-cream border border-stone-line/60 rounded-lg text-xs font-sans text-ink"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase">RECOMMENDED ACTION</span>
                <p className="font-sans text-sm text-ink-soft leading-relaxed bg-cream/40 border border-stone-line/40 rounded-lg p-4">
                  {result.recommendation}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-3 bg-amber-500/5 border border-amber-200/60 rounded-lg p-4 text-xs text-amber-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <p className="font-sans leading-relaxed">{result.disclaimer}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="font-mono-accent text-xs tracking-wider bg-ink text-cream px-5 py-2.5 rounded-full hover:bg-forest transition-colors duration-300"
                >
                  NEW ASSESSMENT
                </button>
              </div>
            </motion.div>
          ) : (
            /* Builder Interface */
            <div className="space-y-6">
              {/* Category selector */}
              <div className="space-y-5">
                <span className="font-mono-accent text-xs tracking-widest text-stone uppercase">01 — SELECT SYMPTOMS</span>
                <div className="space-y-4">
                  {Object.entries(POPULAR_SYMPTOMS).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <span className="font-mono-accent text-[10px] text-stone tracking-wide">{category}</span>
                      <div className="flex flex-wrap gap-2">
                        {items.map((symptom) => {
                          const selected = selectedSymptoms.includes(symptom);
                          return (
                            <button
                              key={symptom}
                              onClick={() => toggleSymptom(symptom)}
                              className={`px-3 py-1.5 rounded-lg border text-xs tracking-wide transition-all duration-300 ${
                                selected
                                  ? "bg-forest border-forest text-cream-light font-medium"
                                  : "bg-cream-light/40 border-stone-line/60 text-ink hover:border-stone"
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

              {/* Custom input */}
              <form onSubmit={handleAddCustom} className="space-y-2">
                <span className="font-mono-accent text-xs tracking-widest text-stone uppercase block">02 — ADD CUSTOM SYMPTOM</span>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Migraine, Numbness"
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    className="flex-1 bg-cream-light/40 border border-stone-line/60 rounded-lg px-4 py-2.5 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-ink text-cream rounded-lg hover:bg-forest transition-colors flex items-center justify-center"
                    aria-label="Add custom symptom"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Selected summary */}
              {selectedSymptoms.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase">SELECTED ({selectedSymptoms.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-forest/10 border border-forest/20 rounded-md text-xs font-sans text-forest"
                      >
                        {s}
                        <button onClick={() => toggleSymptom(s)} aria-label={`Remove ${s}`}>
                          <X className="w-3.5 h-3.5 hover:text-rose-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <span className="font-mono-accent text-xs tracking-widest text-stone uppercase">03 — ADD ADDITIONAL DETAILS (OPTIONAL)</span>
                <textarea
                  placeholder="Describe details like duration, what makes it better/worse, or when it started..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-cream-light/40 border border-stone-line/60 rounded-lg p-4 text-xs text-ink focus:outline-none focus:border-forest transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={selectedSymptoms.length === 0}
                className="w-full bg-ink text-cream font-mono-accent text-xs tracking-widest py-3 rounded-full hover:bg-forest disabled:opacity-50 disabled:hover:bg-ink transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                GENERATE ASSESSMENT REPORT
              </button>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-line/60 pb-3">
            <h3 className="font-display text-md uppercase tracking-wider text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone" />
              History Logs
            </h3>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {historyLoading ? (
              <div className="py-10 text-center font-mono-accent text-xs text-stone">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center font-mono-accent text-xs text-stone border border-dashed border-stone-line/60 rounded-xl bg-cream-light/10">
                No logs recorded yet.
              </div>
            ) : (
              history.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setViewingLog(log)}
                  className="w-full text-left bg-cream-light/60 border border-stone-line/60 p-4 rounded-xl hover:border-stone/60 transition-all duration-300 flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <span className="font-mono-accent text-[9px] tracking-wide text-stone block">
                      {new Date(log.timestamp).toLocaleDateString()} — {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="font-sans text-xs text-ink font-medium truncate">
                      {log.symptoms?.join(", ")}
                    </p>
                    <span className={`inline-block text-[9px] font-mono-accent tracking-widest border px-2 py-0.5 rounded-full ${getSeverityStyle(log.severity)}`}>
                      {log.severity?.toUpperCase()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {viewingLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingLog(null)}
              className="fixed inset-0 bg-ink"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream border border-stone-line max-w-lg w-full rounded-2xl p-6 relative z-10 space-y-6 max-h-[90vh] overflow-y-auto"
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

              {/* Symptoms */}
              <div className="space-y-1.5">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">SYMPTOMS</span>
                <p className="font-sans text-xs text-ink font-medium bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg">
                  {viewingLog.symptoms?.join(", ")}
                </p>
              </div>

              {/* Notes */}
              {viewingLog.additionalNotes && (
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">ADDITIONAL DETAILS</span>
                  <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 px-3 py-2 rounded-lg leading-relaxed">
                    {viewingLog.additionalNotes}
                  </p>
                </div>
              )}

              {/* Severity & Causes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">SEVERITY LEVEL</span>
                  <div className={`text-center py-2.5 rounded-lg border text-xs font-mono-accent tracking-widest ${getSeverityStyle(viewingLog.severity)}`}>
                    {viewingLog.severity?.toUpperCase()}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">POSSIBLE CAUSES</span>
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

              {/* Recommendation */}
              <div className="space-y-1.5">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">RECOMMENDATION</span>
                <p className="font-sans text-xs text-ink-soft bg-cream-light/60 border border-stone-line/60 p-3 rounded-lg leading-relaxed">
                  {viewingLog.recommendation || viewingLog.triageResult}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="flex gap-2.5 bg-stone-line/20 border border-stone-line/60 rounded-lg p-3 text-[10px] text-stone">
                <HeartHandshake className="w-4 h-4 flex-shrink-0 text-stone" />
                <p className="font-sans leading-relaxed">
                  This report is powered by AI for informational purposes only. Do not ignore professional advice.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
