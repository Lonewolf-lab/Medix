import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { medicationApi } from "@/api/medicationApi";
import { recordApi } from "@/api/recordApi";
import { symptomApi } from "@/api/symptomApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import { sortBiomarkersByPriority } from "@/utils/biomarkerUtils";
import {
  Activity,
  FileText,
  Pill,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Upload,
  Cpu,
  Send,
  X,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Stats States
  const [stats, setStats] = useState({
    activeMedsCount: 0,
    recordsCount: 0,
    latestTriage: { severity: "None", date: "No checks yet" },
  });

  // Biomarker & Report States
  const [summary, setSummary] = useState(null);
  const [hasReport, setHasReport] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedBios, setSelectedBios] = useState([]); // List of parameter names



  const loadDashboardData = async () => {
    try {
      const [meds, records, symptoms] = await Promise.all([
        medicationApi.getActive().catch(() => []),
        recordApi.getAll().catch(() => []),
        symptomApi.getHistory().catch(() => []),
      ]);

      let latestTriage = { severity: "None", date: "No checks yet" };
      if (symptoms && symptoms.length > 0) {
        const latestLog = symptoms[0];
        if (latestLog && latestLog.timestamp) {
          const dateStr = new Date(latestLog.timestamp).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          });
          latestTriage = { severity: latestLog.severity, date: dateStr };
        }
      }

      setStats({
        activeMedsCount: meds.length,
        recordsCount: records.length,
        latestTriage,
      });

      try {
        const summaryData = await dashboardApi.getSummary();
        setSummary(summaryData);
        setHasReport(true);
      } catch (summaryErr) {
        if (summaryErr.status === 404) {
          setHasReport(false);
        } else {
          console.error("Biomarker fetch error: ", summaryErr);
        }
      }
    } catch {
      toast.error("Failed to load dashboard parameters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const toggleBioSelection = (paramName) => {
    setSelectedBios((prev) => {
      const newSelection = prev.includes(paramName)
        ? prev.filter((name) => name !== paramName)
        : [...prev, paramName];
      
      if (!prev.includes(paramName)) {
        window.dispatchEvent(new Event("medix:open-ai-assistant"));
      }
      return newSelection;
    });
  };

  useEffect(() => {
    if (summary?.biomarkers) {
      const selectedDetails = selectedBios
        .map((name) => summary.biomarkers.find((b) => b.parameter === name))
        .filter(Boolean);
      
      window.dispatchEvent(new CustomEvent("medix:active-biomarkers", {
        detail: selectedDetails,
      }));
    } else {
      window.dispatchEvent(new CustomEvent("medix:active-biomarkers", {
        detail: [],
      }));
    }
  }, [selectedBios, summary]);

  useEffect(() => {
    const handleDeselect = (e) => {
      const paramName = e.detail;
      setSelectedBios((prev) => prev.filter((name) => name !== paramName));
    };
    window.addEventListener("medix:deselect-biomarker", handleDeselect);
    return () => {
      window.removeEventListener("medix:deselect-biomarker", handleDeselect);
      window.dispatchEvent(new CustomEvent("medix:active-biomarkers", {
        detail: [],
      }));
    };
  }, []);

  const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds maximum 10MB size limit.");
      return;
    }

    setUploading(true);
    toast.loading("Analyzing lab report biomarkers via AI...", { id: "upload-status" });

    try {
      await dashboardApi.uploadReport(file);
      toast.success("Lab report scanned and biomarkers populated!", { id: "upload-status" });
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || "Failed to analyze document.", { id: "upload-status" });
    } finally {
      setUploading(false);
    }
  };


  const getStatusStyles = (status) => {
    const s = status?.toUpperCase();
    if (s === "HIGH" || s === "LOW" || s === "ABNORMAL") {
      return "bg-rose-500/5 text-rose-600 border-rose-500";
    }
    if (s === "BORDERLINE" || s === "WARNING") {
      return "bg-amber-500/5 text-amber-600 border-amber-500";
    }
    return "bg-emerald-500/5 text-emerald-600 border-emerald-500";
  };

  const dashboardStatsList = [
    {
      label: "Active Medications",
      value: `${stats.activeMedsCount} Course${stats.activeMedsCount !== 1 ? "s" : ""}`,
      desc: "Manage active schedules",
      link: "/medications",
      icon: Pill,
      color: "text-forest",
    },
    {
      label: "Uploaded Records",
      value: `${stats.recordsCount} Document${stats.recordsCount !== 1 ? "s" : ""}`,
      desc: "Browse clinical files",
      link: "/records",
      icon: FileText,
      color: "text-ink",
    },
    {
      label: "Symptom Status",
      value: stats.latestTriage.severity !== "None" ? `${stats.latestTriage.severity} Triage` : "No checks",
      desc: stats.latestTriage.severity !== "None" ? `Evaluated ${stats.latestTriage.date}` : "Run symptom assessment",
      link: "/symptoms",
      icon: Activity,
      color: "text-stone",
    },
  ];

  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto relative">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase">PERSONAL SPACE</span>
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-ink">
          Welcome back, {user?.name || "Member"}.
        </h1>
        <p className="font-sans text-ink-soft max-w-xl text-xs leading-relaxed">
          Your personal health space is synchronized. Review your biomarker stats, manage active prescriptions, or check symptoms with your AI health assistant.
        </p>
      </motion.div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader label="Synchronizing database health parameters..." />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardStatsList.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.label} to={stat.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-cream-light/60 border border-stone-line/60 rounded-xl p-5 hover:border-forest/50 hover:shadow-sm transition-all duration-300 flex items-start justify-between cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">{stat.label}</span>
                      <p className="text-xl font-bold text-ink">{stat.value}</p>
                      <span className="text-[11px] text-ink-soft block">{stat.desc}</span>
                    </div>
                    <div className="p-3 rounded-full bg-forest/10 text-forest">
                      <Icon className="w-4 h-4" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Main Biomarker overview and action layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Biomarker Overview (Col span 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-3">
                <h3 className="font-display text-sm uppercase tracking-wider text-ink flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-forest" />
                  Biomarker Overview
                </h3>
                {hasReport && (
                  <span className="font-mono-accent text-[9px] tracking-widest text-stone">
                    FROM {summary?.fileName?.toUpperCase() || "LATEST REPORT"}
                  </span>
                )}
              </div>

              {!hasReport ? (
                /* Empty / No report state: Upload Box */
                <div className="border border-dashed border-stone-line/80 rounded-2xl p-8 text-center bg-cream-light/10 flex flex-col items-center justify-center py-16 space-y-4">
                  <Upload className="w-8 h-8 text-stone" />
                  <div className="space-y-1">
                    <p className="font-sans text-xs font-semibold text-ink">No lab reports scanned yet</p>
                    <p className="font-sans text-[11px] text-stone max-w-sm leading-relaxed mx-auto">
                      Upload a clinical lab report (PDF/Image) to automatically extract, color-code, and track your metrics.
                    </p>
                  </div>
                  <label className="font-mono-accent text-[10px] tracking-widest bg-ink text-cream hover:bg-forest px-4 py-2 rounded-full cursor-pointer transition-colors uppercase">
                    {uploading ? "Analyzing..." : "Upload & Scan Report"}
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      onChange={handleReportUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                /* Report Present: Biomarkers Grid */
                <div className="space-y-4">
                  
                  {/* Abnormal & assessment summary bar */}
                  {summary && (
                    <div className="bg-cream-light/40 border border-stone-line/50 rounded-xl p-4 text-xs font-sans space-y-2">
                      <div className="flex items-center justify-between font-mono-accent text-[9px] text-stone">
                        <span>METRIC COUNTS</span>
                        <span className="text-rose-600 font-bold">{summary.abnormalCount} ABNORMAL INDICATORS</span>
                      </div>
                      <p className="text-ink-soft leading-relaxed">
                        <span className="font-semibold text-ink">Assessment:</span> {summary.overallAssessment}
                      </p>
                    </div>
                  )}

                  {/* Biomarkers parameters grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sortBiomarkersByPriority(summary?.biomarkers).map((bio) => {
                      const isSelected = selectedBios.includes(bio.parameter);
                      return (
                        <div
                          key={bio.parameter}
                          onClick={() => toggleBioSelection(bio.parameter)}
                          className={`relative border rounded-lg p-3 flex flex-col justify-between h-24 cursor-pointer transition-all ${
                            isSelected
                              ? "border-forest bg-forest/5 shadow-xs"
                              : "border-stone-line/50 bg-cream-light/40 hover:border-stone/60"
                          }`}
                        >
                          {/* Check dot indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-3.5 h-3.5 text-forest fill-cream" />
                            </div>
                          )}

                          <div className="space-y-0.5">
                            <span className="text-[11px] font-semibold text-ink-soft block truncate pr-5">{bio.parameter}</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-lg font-bold text-ink leading-none">{bio.value}</span>
                              <span className="text-[8px] text-stone font-medium">{bio.unit}</span>
                            </div>
                          </div>
                          <div className={`self-start text-[7px] font-mono-accent tracking-widest px-2 py-0.5 rounded-full border uppercase ${getStatusStyles(bio.status)}`}>
                            {bio.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quick actions panel & scan (Col span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-line/60 pb-3">
                <h3 className="font-display text-sm uppercase tracking-wider text-ink">Quick Actions</h3>
              </div>

              <div className="flex flex-col gap-3">
                {hasReport && (
                  <label className="group flex items-center justify-between p-4 bg-ink text-cream hover:bg-forest rounded-xl transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Upload className="w-4 h-4 text-stone" />
                      <span className="font-sans text-xs tracking-wide">Upload Newer Lab Report</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      onChange={handleReportUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}

                <Link
                  to="/symptoms"
                  className="group flex items-center justify-between p-4 bg-cream-light/60 border border-stone-line/60 text-ink hover:border-forest rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-forest" />
                    <span className="font-sans text-xs tracking-wide">Triage Symptoms</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/chat"
                  className="group flex items-center justify-between p-4 bg-cream-light/60 border border-stone-line/60 text-ink hover:border-forest rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-stone" />
                    <span className="font-sans text-xs tracking-wide">Consult AI Chat</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
