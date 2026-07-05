import { useState, useEffect, useRef } from "react";
import { recordApi } from "@/api/recordApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Trash2,
  Cpu,
  Send,
  Download,
  X,
  ChevronRight,
  Filter,
  MessageSquare,
  ShieldCheck,
  Edit2,
  Upload,
} from "lucide-react";

const RECORD_TYPES = [
  { value: "LAB_REPORT", label: "Lab Report" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "VACCINATION", label: "Vaccination Record" },
  { value: "OTHER", label: "Other Document" },
];

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterType, setFilterType] = useState("");

  // Upload & Auto-Analyze State
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState("LAB_REPORT");
  const [recordDate, setRecordDate] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Chat State
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  // Biomarkers Edit State
  const [isEditingFindings, setIsEditingFindings] = useState(false);
  const [editedFindings, setEditedFindings] = useState([]);

  const fetchRecords = async () => {
    try {
      const data = await recordApi.getAll();
      setRecords(data);
    } catch (err) {
      toast.error("Failed to load health records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Sync findings when a record is selected
  useEffect(() => {
    if (selectedRecord && selectedRecord.aiAnalysis) {
      try {
        const parsed = JSON.parse(selectedRecord.aiAnalysis);
        setEditedFindings(parsed.findings || []);
      } catch {
        setEditedFindings([]);
      }
    } else {
      setEditedFindings([]);
    }
    setIsEditingFindings(false);
  }, [selectedRecord]);

  // Fetch document chat history when a record is selected
  useEffect(() => {
    if (selectedRecord && selectedRecord.aiAnalysis) {
      loadChatHistory(selectedRecord.id);
    } else {
      setChatHistory([]);
    }
  }, [selectedRecord]);

  const loadChatHistory = async (id) => {
    try {
      const history = await recordApi.getChatHistory(id);
      setChatHistory(history);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("Failed to load chat history.");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max limit is 10MB.");
      return;
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Invalid file type. Please upload a PDF, JPG, or PNG.");
      return;
    }

    setFile(selected);
    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt.replace(/[-_]/g, " "));
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setActionLoading(true);
    setLoadingLabel("Uploading health record...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("recordType", recordType);
    if (description) formData.append("description", description);
    if (recordDate) formData.append("recordDate", recordDate);

    try {
      // 1. Upload
      const newRecord = await recordApi.create(formData);
      
      // 2. Immediate auto-analysis
      setLoadingLabel("Extracting biomarkers & analyzing report...");
      const analysisResult = await recordApi.analyze(newRecord.id);
      
      // 3. Fetch completed record
      const finalRecord = await recordApi.getById(newRecord.id);
      
      toast.success("Record uploaded and analyzed successfully!");
      setRecords((prev) => [finalRecord, ...prev]);
      setSelectedRecord(finalRecord);

      // Reset form
      setTitle("");
      setDescription("");
      setRecordType("LAB_REPORT");
      setRecordDate("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err.message || "Failed during upload and analysis.");
    } finally {
      setActionLoading(false);
      setLoadingLabel("");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record? This action is permanent.")) return;

    try {
      await recordApi.deleteRecord(id);
      toast.success("Record deleted.");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch {
      toast.error("Failed to delete record.");
    }
  };

  const handleAddFindingField = () => {
    setEditedFindings((prev) => [
      ...prev,
      { parameter: "", value: "", status: "NORMAL", explanation: "" },
    ]);
  };

  const handleRemoveFindingField = (index) => {
    setEditedFindings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFindingChange = (index, field, val) => {
    setEditedFindings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRecord) return;
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(selectedRecord.aiAnalysis) || {};
      } catch {
        parsed = {};
      }

      const updatedAnalysis = {
        ...parsed,
        findings: editedFindings,
        abnormalCount: editedFindings.filter((f) => f.status !== "NORMAL").length,
      };

      const updatedRecord = await recordApi.update(selectedRecord.id, {
        title: selectedRecord.title,
        recordType: selectedRecord.recordType,
        recordDate: selectedRecord.recordDate,
        description: selectedRecord.description,
        aiAnalysis: JSON.stringify(updatedAnalysis),
      });

      toast.success("Biomarkers updated successfully!");
      setSelectedRecord(updatedRecord);
      setRecords((prev) =>
        prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r))
      );
      setIsEditingFindings(false);
    } catch (err) {
      toast.error("Failed to save edited biomarkers.");
    }
  };

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

  const handleSendChat = async (e) => {
    e.preventDefault();
    const msg = chatMsg.trim();
    if (!msg || !selectedRecord) return;

    setChatMsg("");
    setChatLoading(true);

    const tempUserMsg = {
      id: Math.random().toString(),
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, tempUserMsg]);
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      const response = await recordApi.sendChat(selectedRecord.id, msg);
      setChatHistory((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, response]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast.error(err.message || "Failed to send message.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!selectedRecord) return;
    try {
      await recordApi.clearChatHistory(selectedRecord.id);
      setChatHistory([]);
      toast.success("Chat history cleared.");
    } catch {
      toast.error("Failed to clear chat history.");
    }
  };

  const filteredRecords = filterType
    ? records.filter((r) => r.recordType === filterType)
    : records;

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-16">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase block">
          CLINICAL ARCHIVE
        </span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink leading-none">
          Health Records
        </h1>
        <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
          Upload medical charts, PDFs, or images for permanent storage and trigger deep AI-powered record index extraction.
        </p>
      </div>

      {/* Top Section: Left (Form or Biomarkers) | Right (Chat Consult) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Panel: Upload Form OR Biomarkers (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {actionLoading ? (
            <div className="py-24 flex items-center justify-center border border-dashed border-stone-line/60 rounded-2xl bg-cream-light/10">
              <Loader label={loadingLabel} />
            </div>
          ) : !selectedRecord ? (
            /* Upload Form (Displayed at start) */
            <form onSubmit={handleUploadAndAnalyze} className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-1.5">
                <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
                  01 — UPLOAD RECORD
                </span>
                <span className="font-mono-accent text-[9px] text-stone uppercase">AUTO-ANALYZE ENABLED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* File Input */}
                <div className="space-y-2">
                  <label className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    FILE (PDF, JPG, PNG - MAX 10MB)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,image/jpeg,image/png"
                    required
                    className="w-full text-xs text-ink file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border file:border-stone-line/60 file:bg-transparent file:text-ink file:font-mono-accent file:text-[10px] file:tracking-wider hover:file:border-stone transition-all cursor-pointer"
                  />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    RECORD TITLE
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Lab Report March"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1 text-xs text-ink transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Type Select */}
                <div className="space-y-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    RECORD TYPE
                  </span>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1.5 text-xs text-ink transition-colors"
                  >
                    {RECORD_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-cream text-ink">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                    RECORD DATE (OPTIONAL)
                  </span>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1 text-xs text-ink transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block">
                  DESCRIPTION / NOTES
                </span>
                <input
                  type="text"
                  placeholder="Details or brief summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1 text-xs text-ink transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="font-mono-accent text-xs tracking-[0.2em] bg-ink text-cream px-6 py-2.5 rounded-full hover:bg-forest transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  UPLOAD & ANALYZE
                </button>
              </div>
            </form>
          ) : (
            /* AI Summary & Extracted Biomarkers (Replaces Form when record selected) */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-1.5">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="font-mono-accent text-[10px] tracking-[0.2em] text-stone hover:text-ink flex items-center gap-1.5 uppercase"
                >
                  ← Upload New Record
                </button>
                <div className="flex gap-2">
                  {selectedRecord.fileUrl && (
                    <a
                      href={`http://localhost:8080${selectedRecord.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-stone hover:text-forest transition-colors"
                      title="Download document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(selectedRecord.id)}
                    className="p-1 text-stone hover:text-rose-500 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl uppercase tracking-wider text-ink">
                  {selectedRecord.title}
                </h3>
                <div className="flex gap-2 text-[9px] font-mono-accent text-stone uppercase">
                  <span>TYPE: {selectedRecord.recordType}</span>
                  <span>•</span>
                  <span>DATE: {selectedRecord.recordDate || "N/A"}</span>
                </div>
              </div>

              {/* Summary Block */}
              <div className="bg-cream-light border border-stone-line/50 rounded-xl p-4 space-y-2 text-xs">
                <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-forest" /> AI Assessment Summary
                </span>
                <p className="font-sans text-ink-soft leading-relaxed text-[11px]">
                  {(() => {
                    try {
                      const parsed = JSON.parse(selectedRecord.aiAnalysis);
                      return parsed.summary || parsed.overallAssessment || "No summary provided.";
                    } catch {
                      return selectedRecord.aiAnalysis;
                    }
                  })()}
                </p>
              </div>

              {/* Biomarkers Panel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-stone-line/40 pb-1">
                  <span className="font-mono-accent text-[10px] tracking-wider text-stone uppercase">
                    Extracted Biomarkers
                  </span>
                  {!isEditingFindings && (
                    <button
                      onClick={() => setIsEditingFindings(true)}
                      className="text-[10px] font-mono-accent text-forest hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit values
                    </button>
                  )}
                </div>

                {isEditingFindings ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {editedFindings.map((finding, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-cream-light p-2 rounded-lg border border-stone-line/40">
                          <input
                            type="text"
                            placeholder="Biomarker"
                            value={finding.parameter}
                            onChange={(e) => handleFindingChange(idx, "parameter", e.target.value)}
                            className="flex-1 bg-transparent text-[11px] text-ink focus:outline-none border-b border-stone-line/40"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={finding.value}
                            onChange={(e) => handleFindingChange(idx, "value", e.target.value)}
                            className="w-20 bg-transparent text-[11px] text-ink focus:outline-none border-b border-stone-line/40"
                          />
                          <select
                            value={finding.status}
                            onChange={(e) => handleFindingChange(idx, "status", e.target.value)}
                            className="bg-transparent text-[10px] font-mono-accent text-ink focus:outline-none border-b border-stone-line/40"
                          >
                            <option value="NORMAL">NORMAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="LOW">LOW</option>
                            <option value="ABNORMAL">ABNORMAL</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveFindingField(idx)}
                            className="text-stone hover:text-rose-500 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={handleAddFindingField}
                        className="text-[10px] font-mono-accent text-stone hover:text-ink flex items-center gap-1 border border-dashed border-stone-line/60 px-2 py-1 rounded"
                      >
                        <Plus className="w-3 h-3" /> Add Biomarker
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingFindings(false);
                            try {
                              const parsed = JSON.parse(selectedRecord.aiAnalysis);
                              setEditedFindings(parsed.findings || []);
                            } catch {
                              setEditedFindings([]);
                            }
                          }}
                          className="text-[10px] font-mono-accent text-stone hover:text-ink px-2.5 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          className="text-[10px] font-mono-accent bg-ink text-cream px-3 py-1 rounded hover:bg-forest"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-1.5">
                    {editedFindings.length === 0 ? (
                      <p className="text-xs text-stone italic">No biomarker values extracted.</p>
                    ) : (
                      <div className="border border-stone-line/40 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse bg-cream-light/40">
                          <thead>
                            <tr className="border-b border-stone-line/40 font-mono-accent text-[9px] text-stone uppercase bg-cream-light">
                              <th className="px-3 py-1.5 font-medium">Biomarker</th>
                              <th className="px-3 py-1.5 font-medium text-right">Value</th>
                              <th className="px-3 py-1.5 font-medium text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editedFindings.map((f, idx) => (
                              <tr key={idx} className="border-b border-stone-line/20 last:border-none">
                                <td className="px-3 py-2 font-medium text-ink">{f.parameter}</td>
                                <td className="px-3 py-2 text-right font-sans text-ink-soft">{f.value}</td>
                                <td className="px-3 py-2 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono-accent font-semibold ${
                                      f.status === "NORMAL"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : f.status === "LOW"
                                        ? "bg-amber-500/10 text-amber-600"
                                        : "bg-rose-500/10 text-rose-600"
                                    }`}
                                  >
                                    {f.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Consult Chat (Col span 5) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-hidden">
          <div className="border-b border-stone-line/60 pb-1.5 mb-4 flex-shrink-0">
            <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
              02 — CONSULT PORTAL
            </span>
          </div>

          <AnimatePresence mode="wait">
            {selectedRecord && selectedRecord.aiAnalysis ? (
              <motion.div
                key={selectedRecord.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="flex-1 flex flex-col h-[480px] bg-cream-light/30 border border-stone-line/60 rounded-2xl overflow-hidden p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-line/40 pb-2 flex-shrink-0">
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-stone" /> Document Consult Chat
                  </span>
                  <button
                    onClick={handleClearChat}
                    className="text-[9px] font-mono-accent tracking-widest text-stone hover:text-rose-500 uppercase"
                  >
                    Wipe History
                  </button>
                </div>

                {/* Chat Messages */}
                <div className="h-[340px] overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <ShieldCheck className="w-6 h-6 text-stone mb-2" />
                      <p className="font-sans text-[11px] text-stone leading-relaxed max-w-[200px]">
                        Ask questions regarding your lab values, trends, or medical guidance.
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((m) => (
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

                {/* Chat Input */}
                <form onSubmit={handleSendChat} className="flex gap-2 border-t border-stone-line/40 pt-3 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Ask about this document..."
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    disabled={chatLoading}
                    className="flex-1 bg-cream border border-stone-line/60 rounded-full px-4 py-2 text-xs text-ink focus:outline-none focus:border-forest transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatMsg.trim()}
                    className="w-8 h-8 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-forest disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </motion.div>
            ) : (
              /* No selection placeholder */
              <div className="h-48 border border-dashed border-stone-line/60 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-8 h-8 text-stone mb-2" />
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase block">
                  NO SELECTION
                </span>
                <p className="font-sans text-[11px] text-stone max-w-[200px] mt-1 leading-relaxed">
                  Select a document or upload a new record to begin your AI clinical consult.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Section: Archive Database */}
      <div className="border-t border-stone-line/60 pt-10 space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone">HISTORY ARCHIVE</span>
            <h3 className="font-display text-xl uppercase tracking-wider text-ink">Archive Database</h3>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono-accent text-stone">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none outline-none text-ink text-[10px] font-mono-accent cursor-pointer"
            >
              <option value="">All Types</option>
              {RECORD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center font-mono-accent text-xs text-stone">Loading database records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-10 text-center font-mono-accent text-xs text-stone border border-dashed border-stone-line/60 rounded-xl">
            No records indexed matching criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`text-left bg-transparent border-b border-stone-line/60 hover:border-forest pb-4 transition-all duration-300 flex items-start justify-between gap-3 group ${
                  selectedRecord?.id === rec.id ? "border-forest" : ""
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 ${selectedRecord?.id === rec.id ? "text-forest" : "text-stone"}`} />
                    <span className="font-mono-accent text-[9px] tracking-wide text-stone block">
                      {rec.recordDate || new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-ink font-semibold truncate group-hover:text-forest transition-colors">
                    {rec.title}
                  </p>
                  <span className="inline-block text-[9px] font-mono-accent tracking-widest text-stone uppercase">
                    {rec.recordType}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
