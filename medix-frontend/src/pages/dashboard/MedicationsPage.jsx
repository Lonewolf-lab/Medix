import { useState, useEffect, useRef } from "react";
import { medicationApi } from "@/api/medicationApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import {
  Pill,
  Plus,
  Trash2,
  Clock,
  ChevronRight,
  X,
  FileText,
  Upload,
  Cpu,
  Play,
  Square,
  AlertCircle,
  Bell,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";

// Reuse custom UI Select & Datepicker
function ThemeSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const active = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-cream-light/60 border border-stone-line/60 rounded-lg pl-3 pr-10 py-2 text-xs text-ink text-left focus:outline-none focus:border-forest flex items-center justify-between cursor-pointer"
      >
        <span>{active.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-cream border border-stone-line rounded-lg shadow-lg overflow-hidden py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                opt.value === value
                  ? "bg-forest text-cream-light font-medium hover:bg-forest-bright"
                  : "text-ink hover:bg-forest/10 hover:text-forest"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeDatePicker({ value, onChange, placeholder = "Select date..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const selectDay = (day) => {
    if (!day) return;
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const formatDateLabel = () => {
    if (!value) return placeholder;
    const [y, m, d] = value.split("-");
    return `${m}/${d}/${y}`;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-cream-light/60 border border-stone-line/60 rounded-lg pl-3 pr-10 py-2 text-xs text-ink text-left focus:outline-none focus:border-forest flex items-center justify-between cursor-pointer"
      >
        <span className={value ? "text-ink" : "text-stone"}>{formatDateLabel()}</span>
        <CalendarIcon className="w-3.5 h-3.5 text-stone" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 md:left-0 bg-cream border border-stone-line rounded-xl shadow-xl p-4 w-[260px]">
          <div className="flex items-center justify-between border-b border-stone-line/40 pb-2 mb-2">
            <button type="button" onClick={handlePrevMonth} className="text-stone hover:text-ink text-sm font-bold px-1.5 py-0.5 rounded hover:bg-cream-light cursor-pointer">
              &lt;
            </button>
            <span className="font-mono-accent text-[11px] tracking-wide text-ink font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button type="button" onClick={handleNextMonth} className="text-stone hover:text-ink text-sm font-bold px-1.5 py-0.5 rounded hover:bg-cream-light cursor-pointer">
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className="font-mono-accent text-[8px] text-stone uppercase font-bold">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth().map((day, idx) => {
              if (!day) return <div key={idx} />;
              const isSelected = value && 
                day.getFullYear() === parseInt(value.split("-")[0]) &&
                day.getMonth() === parseInt(value.split("-")[1]) - 1 &&
                day.getDate() === parseInt(value.split("-")[2]);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`aspect-square text-[10px] font-sans rounded-md transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-forest text-cream-light font-semibold hover:bg-forest-bright"
                      : "text-ink hover:bg-forest/10 hover:text-forest"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("add-manual"); // manual vs scan
  const [listTab, setListTab] = useState("active"); // active vs expired
  const [selectedMed, setSelectedMed] = useState(null);

  // Form State (Manual Logging)
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("ONCE_DAILY");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Prescription Scanner State
  const [scanLoading, setScanLoading] = useState(false);
  const [extractedMeds, setExtractedMeds] = useState([]);
  const fileInputRef = useRef(null);

  // Reminders Management
  const [newReminderTime, setNewReminderTime] = useState("");

  // continuation state
  const [continuationDays, setContinuationDays] = useState(30);

  const fetchMedications = async () => {
    try {
      const data = await medicationApi.getAll();
      setMedications(data);
    } catch {
      toast.error("Failed to load medication tracker.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!name || !dosage || !startDate) {
      toast.error("Medication Name, Dosage, and Start Date are required.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        name,
        dosage,
        frequency,
        startDate,
        endDate: endDate || null,
        notes: instructions || null, // backend field is `notes`
      };
      const response = await medicationApi.create(payload);
      toast.success("Medication added to tracker!");
      setMedications((prev) => [response, ...prev]);
      
      // Reset Form
      setName("");
      setDosage("");
      setFrequency("ONCE_DAILY");
      setStartDate("");
      setEndDate("");
      setInstructions("");
    } catch (err) {
      toast.error(err.message || "Failed to log medication.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleScan = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Max file size limit is 10MB.");
      return;
    }

    setScanLoading(true);
    setExtractedMeds([]);
    try {
      const response = await medicationApi.extractPrescription(selectedFile);
      toast.success("Prescription scanned successfully!");
      // Extraction returns `notes`; the editable table works with `instructions`
      setExtractedMeds(
        (response.extractedMedications || []).map((m) => ({
          ...m,
          instructions: m.notes || m.instructions || "",
        })),
      );
    } catch (err) {
      toast.error(err.message || "Failed to parse prescription.");
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const normalizeFrequency = (freq) => {
    if (!freq) return "ONCE_DAILY";
    const f = freq.toLowerCase();
    if (f.includes("three")) return "THREE_TIMES_DAILY";
    if (f.includes("twice") || f.includes("two") || f.includes("2x") || f.includes("bid")) return "TWICE_DAILY";
    if (f.includes("once") || f.includes("one") || f.includes("1x") || f.includes("qd") || f.includes("daily") || f.includes("morning")) return "ONCE_DAILY";
    if (f.includes("week")) return "WEEKLY";
    if (f.includes("need") || f.includes("prn")) return "AS_NEEDED";
    return "ONCE_DAILY";
  };

  const handleConfirmExtraction = async () => {
    if (extractedMeds.length === 0) return;
    setScanLoading(true);
    try {
      // Map extracted medications default dates (starts today for 30 days)
      const today = new Date().toISOString().split("T")[0];
      const monthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const payload = extractedMeds.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: normalizeFrequency(m.frequency),
        notes: m.instructions || m.notes || "", // backend field is `notes`; table edits live in `instructions`
        startDate: today,
        endDate: monthLater,
      }));

      const saved = await medicationApi.confirmPrescription(payload);
      toast.success(`${saved.length} medications added to tracker!`);
      setMedications((prev) => [...saved, ...prev]);
      setExtractedMeds([]);
      setActiveTab("add-manual");
    } catch (err) {
      toast.error("Failed to batch save medications.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminderTime || !selectedMed) return;

    try {
      const response = await medicationApi.addReminder(selectedMed.id, {
        reminderTime: newReminderTime,
      });
      toast.success("Reminder set.");
      const updatedMed = {
        ...selectedMed,
        reminders: [...(selectedMed.reminders || []), response],
      };
      setSelectedMed(updatedMed);
      setMedications((prev) => prev.map((m) => (m.id === selectedMed.id ? updatedMed : m)));
      setNewReminderTime("");
    } catch {
      toast.error("Failed to add reminder.");
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!selectedMed) return;
    try {
      await medicationApi.deleteReminder(selectedMed.id, reminderId);
      toast.success("Reminder deleted.");
      const updatedMed = {
        ...selectedMed,
        reminders: selectedMed.reminders.filter((r) => r.id !== reminderId),
      };
      setSelectedMed(updatedMed);
      setMedications((prev) => prev.map((m) => (m.id === selectedMed.id ? updatedMed : m)));
    } catch {
      toast.error("Failed to delete reminder.");
    }
  };

  const handleStopMed = async (id) => {
    try {
      const response = await medicationApi.stopMedication(id);
      toast.success("Medication tracker stopped.");
      setMedications((prev) => prev.map((m) => (m.id === id ? response : m)));
      if (selectedMed?.id === id) setSelectedMed(response);
    } catch {
      toast.error("Failed to stop medication.");
    }
  };

  const handleContinueMed = async (id) => {
    try {
      // Backend expects a concrete new end date, not a day count
      const newEndDate = new Date(Date.now() + continuationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const response = await medicationApi.continueMedication(id, { newEndDate });
      toast.success(`Medication extended by ${continuationDays} days.`);
      setMedications((prev) => prev.map((m) => (m.id === id ? response : m)));
      if (selectedMed?.id === id) setSelectedMed(response);
    } catch {
      toast.error("Failed to extend medication.");
    }
  };

  const handleDeleteMed = async (id) => {
    if (!confirm("Are you sure you want to delete this medication test log?")) return;
    try {
      await medicationApi.deleteMedication(id);
      toast.success("Medication deleted.");
      setMedications((prev) => prev.filter((m) => m.id !== id));
      if (selectedMed?.id === id) setSelectedMed(null);
    } catch {
      toast.error("Failed to delete medication.");
    }
  };

  // Lists filtering
  const activeMeds = medications.filter((m) => m.active);
  const expiredMeds = medications.filter((m) => !m.active);
  const displayedMeds = listTab === "active" ? activeMeds : expiredMeds;

  const frequencies = [
    { value: "ONCE_DAILY", label: "Once Daily" },
    { value: "TWICE_DAILY", label: "Twice Daily" },
    { value: "THREE_TIMES_DAILY", label: "Three Times Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "AS_NEEDED", label: "As Needed (PRN)" },
  ];

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <div className="space-y-2">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase block">
          TREATMENT PORTAL
        </span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink leading-none">
          Medication Tracker
        </h1>
        <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
          Log active prescriptions manually, scan pharmacy scripts via AI extraction, and schedule smart reminder logs.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Logging & Prescription Scan (Col Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Action Tabs */}
          <div className="flex gap-4 border-b border-stone-line/60 pb-2">
            <button
              onClick={() => setActiveTab("add-manual")}
              className={`font-mono-accent text-xs tracking-wider uppercase pb-1 cursor-pointer transition-all ${
                activeTab === "add-manual"
                  ? "border-b border-forest text-forest font-semibold"
                  : "text-stone hover:text-ink"
              }`}
            >
              Manual Log
            </button>
            <button
              onClick={() => setActiveTab("scan")}
              className={`font-mono-accent text-xs tracking-wider uppercase pb-1 cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === "scan"
                  ? "border-b border-forest text-forest font-semibold"
                  : "text-stone hover:text-ink"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> AI Scanner
            </button>
          </div>

          {activeTab === "add-manual" ? (
            /* Manual Log Form */
            <form onSubmit={handleCreateManual} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Medication Name */}
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    MEDICATION NAME
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Metformin, Lipitor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-cream-light/60 border border-stone-line/60 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-1.5">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    DOSAGE
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 1 tablet"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    required
                    className="w-full bg-cream-light/60 border border-stone-line/60 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Frequency Select */}
                <div className="space-y-1.5 sm:col-span-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    FREQUENCY
                  </span>
                  <ThemeSelect
                    value={frequency}
                    onChange={(val) => setFrequency(val)}
                    options={frequencies}
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-1.5 sm:col-span-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    START DATE
                  </span>
                  <ThemeDatePicker
                    value={startDate}
                    onChange={(val) => setStartDate(val)}
                    placeholder="Select start date..."
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5 sm:col-span-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    END DATE (OPTIONAL)
                  </span>
                  <ThemeDatePicker
                    value={endDate}
                    onChange={(val) => setEndDate(val)}
                    placeholder="Select end date..."
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                  INSTRUCTIONS / NOTES
                </span>
                <input
                  type="text"
                  placeholder="e.g. Take with food, morning and evening..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-cream-light/60 border border-stone-line/60 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="font-mono-accent text-xs tracking-[0.2em] bg-ink text-cream px-8 py-3 rounded-full hover:bg-forest disabled:opacity-50 transition-all duration-300 hover:scale-105"
                >
                  LOG MEDICATION
                </button>
              </div>
            </form>
          ) : (
            /* AI Scanner Form */
            <div className="space-y-6">
              {scanLoading ? (
                <div className="py-16 text-center border border-dashed border-stone-line/60 rounded-2xl bg-cream-light/10">
                  <Loader label="Scanning prescription and extracting parameters..." />
                </div>
              ) : extractedMeds.length > 0 ? (
                /* Extracted Review Table */
                <div className="space-y-5">
                  <div className="border-b border-stone-line/45 pb-1">
                    <span className="font-mono-accent text-[10px] tracking-wider text-forest font-semibold uppercase block">
                      AI Extracted Medications Review
                    </span>
                  </div>

                  <div className="border border-stone-line/40 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse bg-cream-light/40">
                      <thead>
                        <tr className="border-b border-stone-line/40 font-mono-accent text-[9px] text-stone uppercase bg-cream-light">
                          <th className="px-3 py-2 font-medium">Medication</th>
                          <th className="px-3 py-2 font-medium">Dosage</th>
                          <th className="px-3 py-2 font-medium">Frequency</th>
                          <th className="px-3 py-2 font-medium">Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedMeds.map((m, idx) => (
                          <tr key={idx} className="border-b border-stone-line/20 last:border-none">
                            <td className="px-3 py-2.5 font-medium text-ink">
                              <input
                                type="text"
                                value={m.name}
                                onChange={(e) => {
                                  const updated = [...extractedMeds];
                                  updated[idx].name = e.target.value;
                                  setExtractedMeds(updated);
                                }}
                                className="bg-transparent border-none outline-none font-sans text-xs w-full text-ink"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={m.dosage}
                                onChange={(e) => {
                                  const updated = [...extractedMeds];
                                  updated[idx].dosage = e.target.value;
                                  setExtractedMeds(updated);
                                }}
                                className="bg-transparent border-none outline-none font-sans text-xs w-full text-ink-soft"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={m.frequency || ""}
                                onChange={(e) => {
                                  const updated = [...extractedMeds];
                                  updated[idx].frequency = e.target.value;
                                  setExtractedMeds(updated);
                                }}
                                className="bg-transparent border-none outline-none font-sans text-xs w-full text-ink-soft"
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="text"
                                value={m.instructions || ""}
                                onChange={(e) => {
                                  const updated = [...extractedMeds];
                                  updated[idx].instructions = e.target.value;
                                  setExtractedMeds(updated);
                                }}
                                className="bg-transparent border-none outline-none font-sans text-xs w-full text-ink-soft"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setExtractedMeds([])}
                      className="font-mono-accent text-[10px] tracking-widest text-stone hover:text-ink px-4 py-2"
                    >
                      Discard Scan
                    </button>
                    <button
                      onClick={handleConfirmExtraction}
                      className="font-mono-accent text-xs tracking-widest bg-forest text-cream-light px-6 py-2.5 rounded-full hover:bg-forest-bright transition-all"
                    >
                      Save to Tracker
                    </button>
                  </div>
                </div>
              ) : (
                /* Scanner File Upload box */
                <div className="space-y-4">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    UPLOAD PRESCRIPTION SHEET
                  </span>
                  <div className="border border-dashed border-stone-line rounded-2xl p-8 text-center bg-cream-light/30 flex flex-col items-center justify-center space-y-4">
                    <FileText className="w-10 h-10 text-stone" />
                    <div className="space-y-1">
                      <p className="font-sans text-xs text-ink font-semibold">Upload paper prescription photo or PDF</p>
                      <p className="font-sans text-[10px] text-stone">AI will extract name, dosage, schedule and auto-log them</p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleScan}
                      accept=".pdf,image/jpeg,image/png"
                      className="hidden"
                      id="prescription-file"
                    />
                    <label
                      htmlFor="prescription-file"
                      className="px-5 py-2 bg-ink text-cream font-mono-accent text-[10px] tracking-widest rounded-full hover:bg-forest transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" /> SELECT PRESCRIPTION FILE
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Tracker Database & Active Detail (Col Span 5) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="border-b border-stone-line/60 pb-1.5 flex items-center justify-between">
            <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
              02 — TRACKER DATABASE
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setListTab("active")}
                className={`font-mono-accent text-[10px] tracking-wider uppercase cursor-pointer ${
                  listTab === "active" ? "text-forest font-semibold" : "text-stone hover:text-ink"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setListTab("expired")}
                className={`font-mono-accent text-[10px] tracking-wider uppercase cursor-pointer ${
                  listTab === "expired" ? "text-forest font-semibold" : "text-stone hover:text-ink"
                }`}
              >
                Expired
              </button>
            </div>
          </div>

          {displayedMeds.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-stone-line/60 rounded-xl font-mono-accent text-xs text-stone">
              No medications logged in this catalog.
            </div>
          ) : (
            <div className="space-y-1">
              {displayedMeds.map((med) => (
                <div key={med.id} className="border-b border-stone-line/30 pb-3 pt-3">
                  <div className="flex items-start justify-between gap-4">
                    <button
                      onClick={() => setSelectedMed(selectedMed?.id === med.id ? null : med)}
                      className="text-left min-w-0 flex items-start gap-2.5 group cursor-pointer"
                    >
                      <Pill className={`w-4 h-4 mt-0.5 flex-shrink-0 ${med.active ? "text-forest" : "text-stone"}`} />
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-semibold text-ink truncate group-hover:text-forest transition-colors">
                          {med.name}
                        </p>
                        <p className="font-mono-accent text-[9px] tracking-wide text-stone uppercase">
                          {med.dosage} — {med.frequency}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {med.active ? (
                        <button
                          onClick={() => handleStopMed(med.id)}
                          className="p-1 text-stone hover:text-rose-500 rounded border border-stone-line/50 transition-colors"
                          title="Stop tracker log"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={continuationDays}
                            onChange={(e) => setContinuationDays(parseInt(e.target.value) || 30)}
                            className="w-10 bg-cream-light border border-stone-line/60 rounded text-[10px] p-0.5 text-center"
                            title="Extension days"
                          />
                          <button
                            onClick={() => handleContinueMed(med.id)}
                            className="p-1 text-stone hover:text-forest rounded border border-stone-line/50 transition-colors"
                            title="Renew tracker log"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="p-1 text-stone hover:text-rose-500 rounded border border-stone-line/50 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Expandable: Reminders */}
                  <AnimatePresence>
                    {selectedMed?.id === med.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pl-6 space-y-3 border-l border-stone-line/60 overflow-hidden text-xs"
                      >
                        {med.notes && (
                          <div className="flex gap-1.5 text-ink-soft bg-cream-light/60 p-2 rounded-lg border border-stone-line/40">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-stone" />
                            <p className="font-sans text-[11px] leading-relaxed">{med.notes}</p>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5" /> Reminder Schedules
                          </span>
                          
                          {med.reminders?.length === 0 ? (
                            <p className="text-[10px] text-stone italic">No reminders configured.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {med.reminders?.map((r) => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-forest/10 border border-forest/20 rounded-full text-[10px] text-forest"
                                >
                                  {r.reminderTime}
                                  <button onClick={() => handleDeleteReminder(r.id)} aria-label="Remove reminder">
                                    <X className="w-2.5 h-2.5 hover:text-rose-500" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <form onSubmit={handleAddReminder} className="flex gap-2 pt-1.5">
                            <input
                              type="time"
                              required
                              value={newReminderTime}
                              onChange={(e) => setNewReminderTime(e.target.value)}
                              className="bg-cream-light border border-stone-line/60 rounded px-2 py-0.5 text-xs text-ink focus:outline-none focus:border-forest"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-0.5 bg-ink text-cream text-[10px] font-mono-accent rounded hover:bg-forest transition-colors"
                            >
                              Add Reminder
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
