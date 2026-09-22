import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Plus,
  Trash2,
  Clock,
  FileText,
  Check,
  Calendar,
  AlertCircle,
  Eye,
  Maximize2
} from "lucide-react";

export default function PrescriptionReviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileType,
  fileName,
  extractedMedications = [],
  onConfirm,
  loading = false,
}) {
  const [meds, setMeds] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (extractedMedications && extractedMedications.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      setMeds(
        extractedMedications.map((m, idx) => ({
          id: idx + 1,
          name: m.name === "UNCLEAR" ? "" : m.name || "",
          dosage: m.dosage === "UNCLEAR" ? "" : m.dosage || "",
          frequency: normalizeFrequency(m.frequency),
          startDate: today,
          endDate: calculateEndDate(today, m.duration) || thirtyDaysLater,
          notes: m.instructions || m.notes || "",
          confidence: m.confidence || "MEDIUM",
          reminderTimes: calculateDefaultReminderTimes(m.frequency),
        }))
      );
    } else {
      setMeds([]);
    }
    setZoom(1);
    setRotation(0);
  }, [extractedMedications]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleUpdateMed = (index, field, value) => {
    setMeds((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "frequency") {
        updated[index].reminderTimes = calculateDefaultReminderTimes(value);
      }
      return updated;
    });
  };

  const handleAddMed = () => {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setMeds((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        dosage: "",
        frequency: "ONCE_DAILY",
        startDate: today,
        endDate: thirtyDaysLater,
        notes: "",
        confidence: "HIGH",
        reminderTimes: ["09:00"],
      },
    ]);
  };

  const handleRemoveMed = (index) => {
    setMeds((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddReminderTime = (index, timeStr) => {
    if (!timeStr) return;
    setMeds((prev) => {
      const updated = [...prev];
      const existing = updated[index].reminderTimes || [];
      if (!existing.includes(timeStr)) {
        updated[index].reminderTimes = [...existing, timeStr].sort();
      }
      return updated;
    });
  };

  const handleRemoveReminderTime = (medIndex, timeIndex) => {
    setMeds((prev) => {
      const updated = [...prev];
      updated[medIndex].reminderTimes = updated[medIndex].reminderTimes.filter(
        (_, i) => i !== timeIndex
      );
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validMeds = meds.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      return;
    }
    onConfirm(validMeds);
  };

  const isPdf = fileType?.includes("pdf") || fileName?.toLowerCase().endsWith(".pdf");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="bg-cream border border-stone-line rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-line flex items-center justify-between bg-cream-light/40">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-stone uppercase block">
                Prescription Extraction & Verification
              </span>
              <h2 className="text-lg font-medium text-ink tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-forest" />
                Review Deciphered Prescription
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-lg border border-stone-line hover:bg-stone/10 text-stone hover:text-ink transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Split Screen */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* Left Column: Document Viewer (5 cols) */}
            <div className="lg:col-span-5 bg-ink/5 border-b lg:border-b-0 lg:border-r border-stone-line flex flex-col min-h-[300px] lg:min-h-0">
              {/* Viewer Controls */}
              <div className="px-4 py-2.5 border-b border-stone-line/60 bg-cream-light/60 flex items-center justify-between text-xs text-ink">
                <span className="text-[10px] font-mono tracking-wider text-stone uppercase truncate max-w-[180px]">
                  {fileName || "Original Document"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1 min-w-[40px] text-center text-stone">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1 rounded hover:bg-stone/15 text-ink transition-colors ml-1 cursor-pointer"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="p-1 rounded hover:bg-stone/15 text-stone hover:text-ink transition-colors text-[10px] font-mono uppercase ml-1 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Viewport Canvas */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-stone/5">
                {fileUrl ? (
                  isPdf ? (
                    <div className="w-full h-full min-h-[360px] flex items-center justify-center">
                      <iframe
                        src={fileUrl}
                        title="PDF Prescription Preview"
                        className="w-full h-full min-h-[380px] rounded-lg border border-stone-line bg-white"
                      />
                    </div>
                  ) : (
                    <div className="transition-transform duration-200 flex items-center justify-center">
                      <img
                        src={fileUrl}
                        alt="Prescription Document"
                        style={{
                          transform: `scale(${zoom}) rotate(${rotation}deg)`,
                          transformOrigin: "center center",
                          maxHeight: "75vh",
                        }}
                        className="rounded-lg shadow-md border border-stone-line max-w-full object-contain select-none"
                      />
                    </div>
                  )
                ) : (
                  <div className="text-center p-6 text-stone">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone/60" />
                    <p className="text-xs">Document preview unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Editable Prescription Table (7 cols) */}
            <div className="lg:col-span-7 flex flex-col min-h-0 bg-cream">
              {/* Review instructions bar */}
              <div className="px-6 py-2.5 border-b border-stone-line/60 bg-forest/5 flex items-center justify-between">
                <span className="text-[11px] text-forest font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-forest" />
                  {meds.length} medication{meds.length === 1 ? "" : "s"} deciphered. Verify details before saving.
                </span>
                <button
                  type="button"
                  onClick={handleAddMed}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-forest border border-forest/30 rounded-lg hover:bg-forest/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Medicine
                </button>
              </div>

              {/* Scrollable Medication Cards */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {meds.map((med, index) => (
                  <div
                    key={med.id || index}
                    className="p-4 rounded-xl border border-stone-line bg-cream-light/60 space-y-3 relative group transition-all hover:border-forest/40"
                  >
                    {/* Top Row: Index & Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-forest/10 text-forest text-[11px] font-mono font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-[10px] font-mono tracking-wider uppercase text-stone">
                          Confidence:{" "}
                          <span
                            className={`font-semibold ${
                              med.confidence === "HIGH"
                                ? "text-forest"
                                : med.confidence === "MEDIUM"
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {med.confidence}
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMed(index)}
                        className="p-1 rounded text-stone hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1">
                          Medication Name *
                        </label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleUpdateMed(index, "name", e.target.value)}
                          placeholder="e.g. Amoxicillin 500mg"
                          required
                          className="w-full bg-cream border border-stone-line/80 rounded-lg px-3 py-1.5 text-xs text-ink placeholder:text-stone/40 focus:outline-none focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1">
                          Dosage *
                        </label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleUpdateMed(index, "dosage", e.target.value)}
                          placeholder="e.g. 500mg / 1 tablet"
                          className="w-full bg-cream border border-stone-line/80 rounded-lg px-3 py-1.5 text-xs text-ink placeholder:text-stone/40 focus:outline-none focus:border-forest"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1">
                          Frequency
                        </label>
                        <select
                          value={med.frequency}
                          onChange={(e) => handleUpdateMed(index, "frequency", e.target.value)}
                          className="w-full bg-cream border border-stone-line/80 rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-forest"
                        >
                          <option value="ONCE_DAILY">Once Daily</option>
                          <option value="TWICE_DAILY">Twice Daily</option>
                          <option value="THREE_TIMES_DAILY">Three Times Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="AS_NEEDED">As Needed (SOS)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1">
                          End Date / Duration
                        </label>
                        <input
                          type="date"
                          value={med.endDate}
                          onChange={(e) => handleUpdateMed(index, "endDate", e.target.value)}
                          className="w-full bg-cream border border-stone-line/80 rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>

                    {/* Reminder Times Chips */}
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1 flex items-center justify-between">
                        <span>Reminder Schedule</span>
                        <span className="text-stone/60">24-hour format</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(med.reminderTimes || []).map((time, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest/10 text-forest text-[11px] font-mono border border-forest/20"
                          >
                            <Clock className="w-3 h-3" />
                            {time}
                            <button
                              type="button"
                              onClick={() => handleRemoveReminderTime(index, tIdx)}
                              className="hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="time"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddReminderTime(index, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="bg-cream border border-stone-line/60 rounded px-1.5 py-0.5 text-[11px] font-mono text-ink focus:outline-none focus:border-forest"
                        />
                      </div>
                    </div>

                    {/* Notes / Clinical Instructions */}
                    <div>
                      <label className="text-[10px] font-mono tracking-wider uppercase text-stone block mb-1">
                        Doctor Instructions / Notes
                      </label>
                      <input
                        type="text"
                        value={med.notes}
                        onChange={(e) => handleUpdateMed(index, "notes", e.target.value)}
                        placeholder="e.g. Take after meals with warm water"
                        className="w-full bg-cream border border-stone-line/80 rounded-lg px-3 py-1 text-xs text-ink placeholder:text-stone/40 focus:outline-none focus:border-forest"
                      />
                    </div>
                  </div>
                ))}

                {meds.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-stone-line rounded-xl text-stone">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-stone/40" />
                    <p className="text-xs font-medium text-ink">No medications detected</p>
                    <p className="text-[11px] text-stone mt-0.5">
                      You can manually add entries using the "Add Medicine" button above.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 border-t border-stone-line bg-cream-light/40 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-stone">
                  {meds.filter((m) => m.name.trim().length > 0).length} valid item(s) to save
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-medium text-ink border border-stone-line rounded-xl hover:bg-stone/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || meds.filter((m) => m.name.trim().length > 0).length === 0}
                    className="px-5 py-2 text-xs font-medium bg-forest text-cream-light rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {loading ? (
                      <span>Saving to Schedule...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Add to Schedule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function normalizeFrequency(freq) {
  if (!freq) return "ONCE_DAILY";
  const f = freq.toUpperCase();
  if (f.includes("THREE") || f.includes("TDS") || f.includes("TID") || f.includes("1-1-1"))
    return "THREE_TIMES_DAILY";
  if (f.includes("TWICE") || f.includes("BD") || f.includes("BID") || f.includes("1-0-1"))
    return "TWICE_DAILY";
  if (f.includes("WEEK")) return "WEEKLY";
  if (f.includes("NEED") || f.includes("SOS") || f.includes("PRN")) return "AS_NEEDED";
  return "ONCE_DAILY";
}

function calculateDefaultReminderTimes(freq) {
  const norm = normalizeFrequency(freq);
  switch (norm) {
    case "TWICE_DAILY":
      return ["09:00", "21:00"];
    case "THREE_TIMES_DAILY":
      return ["08:00", "14:00", "20:00"];
    case "WEEKLY":
      return ["10:00"];
    case "AS_NEEDED":
      return [];
    case "ONCE_DAILY":
    default:
      return ["09:00"];
  }
}

function calculateEndDate(startDate, durationStr) {
  if (!durationStr) return null;
  const start = new Date(startDate);
  const match = durationStr.match(/(\d+)\s*(day|week|month)/i);
  if (!match) return null;

  const count = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("day")) {
    start.setDate(start.getDate() + count);
  } else if (unit.startsWith("week")) {
    start.setDate(start.getDate() + count * 7);
  } else if (unit.startsWith("month")) {
    start.setMonth(start.getMonth() + count);
  }

  return start.toISOString().split("T")[0];
}
