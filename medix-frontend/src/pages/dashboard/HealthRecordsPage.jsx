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

  // Upload Form State
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState("LAB_REPORT");
  const [recordDate, setRecordDate] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Analysis & Chat State
  const [analyzing, setAnalyzing] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

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

  // Fetch document chat history when a record is selected
  useEffect(() => {
    if (selectedRecord) {
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

    // Validate size (10MB limit)
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max limit is 10MB.");
      return;
    }

    // Validate type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selected.type)) {
      toast.error("Invalid file type. Please upload a PDF, JPG, or PNG.");
      return;
    }

    setFile(selected);
    if (!title) {
      // Auto-fill title from filename
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt.replace(/[-_]/g, " "));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("recordType", recordType);
    if (description) formData.append("description", description);
    if (recordDate) formData.append("recordDate", recordDate);

    try {
      const newRecord = await recordApi.create(formData);
      toast.success("Health record uploaded successfully.");
      setRecords((prev) => [newRecord, ...prev]);
      setSelectedRecord(newRecord);
      // Reset form
      setTitle("");
      setDescription("");
      setRecordType("LAB_REPORT");
      setRecordDate("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(err.message || "Failed to upload record.");
    } finally {
      setUploading(false);
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

  const handleAnalyze = async (id) => {
    setAnalyzing(true);
    try {
      const response = await recordApi.analyze(id);
      toast.success("AI analysis completed!");
      // Update selected record in local state
      const updatedRecord = await recordApi.getById(id);
      setSelectedRecord(updatedRecord);
      setRecords((prev) => prev.map((r) => (r.id === id ? updatedRecord : r)));
    } catch (err) {
      toast.error(err.message || "Failed to analyze document.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    const msg = chatMsg.trim();
    if (!msg || !selectedRecord) return;

    setChatMsg("");
    setChatLoading(true);

    // Append user message immediately
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

      {/* Main Grid Layout (Directly on canvas, no boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Upload & List (Col span 7) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Upload Form */}
          <form onSubmit={handleUpload} className="space-y-6">
            <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block border-b border-stone-line/60 pb-1">
              01 — UPLOAD RECORD
            </span>

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
                  disabled={uploading}
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
                  disabled={uploading}
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
                  disabled={uploading}
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
                disabled={uploading}
                className="w-full bg-transparent border-b border-stone-line/60 focus:border-forest focus:outline-none py-1 text-xs text-ink transition-colors"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="font-mono-accent text-xs tracking-[0.2em] bg-ink text-cream px-6 py-2.5 rounded-full hover:bg-forest disabled:opacity-50 transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                {uploading ? "UPLOADING..." : "UPLOAD RECORD"}
              </button>
            </div>
          </form>

          {/* Records List */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-stone-line/60 pb-1.5">
              <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
                02 — ARCHIVE DATABASE
              </span>

              {/* Filter */}
              <div className="flex items-center gap-1 text-[10px] font-mono-accent text-stone">
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
              <div className="py-12 text-center font-mono-accent text-xs text-stone">Loading database records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center font-mono-accent text-xs text-stone border border-dashed border-stone-line/60 rounded-xl">
                No records indexed matching criteria.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredRecords.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecord(rec)}
                    className={`w-full text-left py-3.5 border-b border-stone-line/30 hover:border-forest/50 transition-all duration-300 flex items-center justify-between gap-4 group ${
                      selectedRecord?.id === rec.id ? "border-forest" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${selectedRecord?.id === rec.id ? "text-forest" : "text-stone"}`} />
                      <div className="min-w-0">
                        <p className="font-sans text-xs font-semibold text-ink truncate group-hover:text-forest transition-colors">
                          {rec.title}
                        </p>
                        <span className="font-mono-accent text-[9px] tracking-wide text-stone block">
                          {rec.recordDate || new Date(rec.createdAt).toLocaleDateString()} — {rec.recordType}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail Panel & Chat (Col span 5) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-hidden">
          <div className="border-b border-stone-line/60 pb-1.5 mb-4 flex-shrink-0 flex items-center justify-between">
            <span className="font-mono-accent text-[10px] tracking-[0.25em] text-stone uppercase block">
              03 — RECORD CONTEXT
            </span>
            {selectedRecord && (
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-stone hover:text-ink text-[10px] font-mono-accent uppercase tracking-widest flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Close
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedRecord ? (
              <motion.div
                key={selectedRecord.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6 h-full flex flex-col min-h-0"
              >
                {/* Meta details */}
                <div className="space-y-3 flex-shrink-0">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl uppercase tracking-wider text-ink leading-tight">
                      {selectedRecord.title}
                    </h3>
                    <div className="flex gap-2">
                      {selectedRecord.fileUrl && (
                        <a
                          href={`http://localhost:8080${selectedRecord.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-stone hover:text-forest transition-colors rounded-lg border border-stone-line/60"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(selectedRecord.id)}
                        className="p-1.5 text-stone hover:text-rose-500 transition-colors rounded-lg border border-stone-line/60"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[9px] font-mono-accent tracking-widest text-stone uppercase">
                    <span>TYPE: {selectedRecord.recordType}</span>
                    <span>•</span>
                    <span>DATE: {selectedRecord.recordDate || "N/A"}</span>
                  </div>

                  {selectedRecord.description && (
                    <p className="font-sans text-xs text-ink-soft leading-relaxed">
                      {selectedRecord.description}
                    </p>
                  )}
                </div>

                {/* AI Analysis View */}
                <div className="flex-shrink-0">
                  {analyzing ? (
                    <div className="py-6 flex justify-center">
                      <Loader label="AI is reading medical text..." />
                    </div>
                  ) : selectedRecord.aiAnalysis ? (
                    <div className="bg-cream-light border border-stone-line/50 rounded-xl p-4 space-y-2 text-xs">
                      <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase block flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-forest" /> AI Analysis Complete
                      </span>
                      {/* Standard JSON description payload parsing helper */}
                      <p className="font-sans text-ink-soft leading-relaxed text-[11px]">
                        {(() => {
                          try {
                            const parsed = JSON.parse(selectedRecord.aiAnalysis);
                            return parsed.summary || parsed.assessment || selectedRecord.aiAnalysis;
                          } catch {
                            return selectedRecord.aiAnalysis;
                          }
                        })()}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAnalyze(selectedRecord.id)}
                      className="w-full bg-forest text-cream-light font-mono-accent text-[11px] tracking-widest py-2.5 rounded-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Cpu className="w-4 h-4" />
                      ANALYZE DOCUMENT WITH AI
                    </button>
                  )}
                </div>

                {/* Per-document chat interface */}
                {selectedRecord.aiAnalysis && (
                  <div className="flex-1 flex flex-col min-h-0 bg-cream-light/30 border border-stone-line/60 rounded-2xl overflow-hidden p-4 space-y-4">
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
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin">
                      {chatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
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
                            <p
                              className={`px-3 py-2 rounded-xl text-xs font-sans leading-relaxed ${
                                m.role === "user"
                                  ? "bg-ink text-cream"
                                  : "bg-cream border border-stone-line/60 text-ink"
                              }`}
                            >
                              {m.content}
                            </p>
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
                  </div>
                )}
              </motion.div>
            ) : (
              /* No selection placeholder */
              <div className="h-48 border border-dashed border-stone-line/60 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <FileText className="w-8 h-8 text-stone mb-2" />
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase block">
                  NO SELECTION
                </span>
                <p className="font-sans text-[11px] text-stone max-w-[200px] mt-1 leading-relaxed">
                  Select a document from your database to inspect details, trigger AI extraction, and chat.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
