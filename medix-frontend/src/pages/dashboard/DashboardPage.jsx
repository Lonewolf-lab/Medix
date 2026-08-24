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
  ChevronLeft,
  ChevronRight,
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
  const [desktopPage, setDesktopPage] = useState(0);

  const DESKTOP_ITEMS_PER_PAGE = 8;
  const sortedBiomarkers = sortBiomarkersByPriority(summary?.biomarkers || []);
  const totalDesktopPages = Math.ceil(sortedBiomarkers.length / DESKTOP_ITEMS_PER_PAGE) || 1;
  const currentDesktopBiomarkers = sortedBiomarkers.slice(
    desktopPage * DESKTOP_ITEMS_PER_PAGE,
    (desktopPage + 1) * DESKTOP_ITEMS_PER_PAGE
  );

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
      shortLabel: "MEDS",
      value: `${stats.activeMedsCount} Course${stats.activeMedsCount !== 1 ? "s" : ""}`,
      shortValue: `${stats.activeMedsCount} Active`,
      desc: "Manage active schedules",
      link: "/medications",
      icon: Pill,
      color: "text-forest",
    },
    {
      label: "Uploaded Records",
      shortLabel: "RECORDS",
      value: `${stats.recordsCount} Document${stats.recordsCount !== 1 ? "s" : ""}`,
      shortValue: `${stats.recordsCount} Files`,
      desc: "Browse clinical files",
      link: "/records",
      icon: FileText,
      color: "text-ink",
    },
    {
      label: "Symptom Status",
      shortLabel: "TRIAGE",
      value: stats.latestTriage.severity !== "None" ? `${stats.latestTriage.severity} Triage` : "No checks",
      shortValue: stats.latestTriage.severity !== "None" ? stats.latestTriage.severity : "None",
      desc: stats.latestTriage.severity !== "None" ? `Evaluated ${stats.latestTriage.date}` : "Run symptom assessment",
      link: "/symptoms",
      icon: Activity,
      color: "text-stone",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-5xl mx-auto relative">
      {/* Welcome banner & Top Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <span className="font-mono-accent text-[9px] sm:text-[10px] tracking-[0.3em] text-stone uppercase">PERSONAL SPACE</span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-ink">
            Welcome back, {user?.name || "Member"}.
          </h1>
          <p className="font-sans text-ink-soft max-w-xl text-xs leading-relaxed">
            Your personal health space is synchronized. Review your biomarker stats, manage active prescriptions, or check symptoms with your AI health assistant.
          </p>
        </div>

        {/* Top Quick Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
          <Link
            to="/symptoms"
            className="group flex items-center justify-between p-3.5 bg-cream-light/80 border border-stone-line/60 text-ink hover:border-forest rounded-xl transition-all duration-300 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-forest/10 text-forest">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs font-semibold tracking-wide">Triage Symptoms</span>
                <span className="text-[10px] text-ink-soft">AI symptom checker</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/chat"
            className="group flex items-center justify-between p-3.5 bg-cream-light/80 border border-stone-line/60 text-ink hover:border-forest rounded-xl transition-all duration-300 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-ink/10 text-ink">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs font-semibold tracking-wide">Consult AI Chat</span>
                <span className="text-[10px] text-ink-soft">24/7 Health Assistant</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {hasReport ? (
            <label className="group flex items-center justify-between p-3.5 bg-ink text-cream hover:bg-forest rounded-xl transition-all duration-300 cursor-pointer shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cream/10 text-cream">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold tracking-wide">Upload Lab Report</span>
                  <span className="text-[10px] text-cream/70">Scan PDF or Image</span>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                onChange={handleReportUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          ) : (
            <Link
              to="/records"
              className="group flex items-center justify-between p-3.5 bg-cream-light/80 border border-stone-line/60 text-ink hover:border-forest rounded-xl transition-all duration-300 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-line/30 text-ink">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-semibold tracking-wide">Clinical Records</span>
                  <span className="text-[10px] text-ink-soft">Browse uploads</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone group-hover:text-forest transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader label="Synchronizing database health parameters..." />
        </div>
      ) : (
        <>
          {/* Consolidated Unified Stats Strip */}
          <div className="bg-cream-light/80 border border-stone-line/60 rounded-2xl p-3 sm:p-5 shadow-xs">
            <div className="grid grid-cols-3 divide-x divide-stone-line/50 text-center sm:text-left">
              {dashboardStatsList.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link key={stat.label} to={stat.link} className="px-1.5 sm:px-4 first:pl-0 last:pr-0 group">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-accent text-[9px] sm:text-[9px] tracking-widest text-stone uppercase block">
                        <span className="hidden sm:inline">{stat.label}</span>
                        <span className="sm:hidden">{stat.shortLabel}</span>
                      </span>
                      <Icon className="w-3.5 h-3.5 text-stone group-hover:text-forest transition-colors hidden sm:block" />
                    </div>
                    <p className="text-xs sm:text-lg font-bold text-ink mt-0.5 group-hover:text-forest transition-colors">
                      <span className="hidden sm:inline">{stat.value}</span>
                      <span className="sm:hidden">{stat.shortValue}</span>
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-ink-soft block hidden sm:block">
                      {stat.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Biomarker Flashcards Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-line/60 pb-2.5">
              <h3 className="font-display text-xs sm:text-sm uppercase tracking-wider text-ink flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-forest" />
                Biomarker Overview
              </h3>
              
              {hasReport && (
                <div className="flex items-center gap-3">
                  <span className="font-mono-accent text-[8px] sm:text-[9px] tracking-widest text-stone">
                    {summary?.abnormalCount > 0 ? (
                      <span className="text-rose-600 font-bold">{summary.abnormalCount} ABNORMAL</span>
                    ) : (
                      "ALL NORMAL"
                    )}{" "}
                    — {summary?.biomarkers?.length || 0} TOTAL
                  </span>

                  {/* Desktop-only Page Indicator */}
                  {totalDesktopPages > 1 && (
                    <div className="hidden md:flex items-center gap-2 pl-2 border-l border-stone-line/50">
                      <span className="font-mono-accent text-[9px] tracking-widest text-stone font-semibold">
                        PAGE {desktopPage + 1} / {totalDesktopPages}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!hasReport ? (
              /* Empty / No report state */
              <div className="border border-dashed border-stone-line/80 rounded-2xl p-6 sm:p-8 text-center bg-cream-light/10 flex flex-col items-center justify-center py-10 sm:py-14 space-y-4">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-stone" />
                <div className="space-y-1">
                  <p className="font-sans text-xs font-semibold text-ink">No lab report scanned yet</p>
                  <p className="font-sans text-[11px] text-stone max-w-sm leading-relaxed mx-auto">
                    Upload a clinical lab report (PDF/Image) to extract your biomarkers into interactive flashcards.
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
              <div className="space-y-3">
                {/* Overall AI Assessment summary */}
                {summary && (
                  <div className="bg-cream-light/40 border border-stone-line/50 rounded-xl p-3 sm:p-4 text-xs font-sans">
                    <p className="text-ink-soft leading-relaxed text-[11px] sm:text-xs">
                      <span className="font-semibold text-ink">AI Lab Assessment:</span> {summary.overallAssessment}
                    </p>
                  </div>
                )}

                {/* DESKTOP-ONLY: Paginated 3x2 Grid Carousel with Side Flanking Squared Arrow Buttons */}
                <div className="hidden md:block relative space-y-3">
                  {/* Floating Left Arrow Button */}
                  {totalDesktopPages > 1 && (
                    <button
                      onClick={() => setDesktopPage((p) => Math.max(0, p - 1))}
                      disabled={desktopPage === 0}
                      className="absolute -left-11 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-cream-light/95 border border-stone-line/70 text-ink shadow-md flex items-center justify-center hover:bg-forest hover:text-cream-light hover:border-forest transition-all backdrop-blur-md opacity-80 hover:opacity-100 disabled:opacity-20 disabled:hover:bg-cream-light/95 disabled:hover:text-ink disabled:hover:border-stone-line/70 cursor-pointer"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Floating Right Arrow Button */}
                  {totalDesktopPages > 1 && (
                    <button
                      onClick={() => setDesktopPage((p) => Math.min(totalDesktopPages - 1, p + 1))}
                      disabled={desktopPage === totalDesktopPages - 1}
                      className="absolute -right-11 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-xl bg-cream-light/95 border border-stone-line/70 text-ink shadow-md flex items-center justify-center hover:bg-forest hover:text-cream-light hover:border-forest transition-all backdrop-blur-md opacity-80 hover:opacity-100 disabled:opacity-20 disabled:hover:bg-cream-light/95 disabled:hover:text-ink disabled:hover:border-stone-line/70 cursor-pointer"
                      title="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={desktopPage}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-4 gap-3.5"
                    >
                      {currentDesktopBiomarkers.map((bio) => {
                        const isSelected = selectedBios.includes(bio.parameter);
                        return (
                          <div
                            key={bio.parameter}
                            onClick={() => toggleBioSelection(bio.parameter)}
                            className={`relative border rounded-xl p-4 flex flex-col justify-between h-28 cursor-pointer transition-all shadow-xs ${
                              isSelected
                                ? "border-forest bg-forest/5 shadow-sm"
                                : "border-stone-line/60 bg-cream-light/70 hover:border-forest/50 hover:bg-cream-light"
                            }`}
                          >
                            {/* Check dot indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-4 h-4 text-forest fill-cream" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-ink-soft block truncate pr-5">{bio.parameter}</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-ink leading-none">{bio.value}</span>
                                <span className="text-[9px] text-stone font-medium">{bio.unit}</span>
                              </div>
                            </div>

                            <div className={`self-start text-[8px] font-mono-accent tracking-widest px-2 py-0.5 rounded-full border uppercase ${getStatusStyles(bio.status)}`}>
                              {bio.status}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Desktop dot navigation indicators */}
                  {totalDesktopPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 pt-2">
                      {Array.from({ length: totalDesktopPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDesktopPage(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            desktopPage === idx ? "w-6 bg-forest" : "w-1.5 bg-stone-line hover:bg-stone"
                          }`}
                          title={`Go to page ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* MOBILE-ONLY: Horizontal Swipe Track (100% UNTOUCHED!) */}
                <div className="md:hidden relative">
                  <div className="flex overflow-x-auto gap-3 pb-3 pt-1 px-0.5 scrollbar-none snap-x snap-mandatory">
                    {sortBiomarkersByPriority(summary?.biomarkers).map((bio) => {
                      const isSelected = selectedBios.includes(bio.parameter);
                      return (
                        <div
                          key={bio.parameter}
                          onClick={() => toggleBioSelection(bio.parameter)}
                          className={`w-[145px] shrink-0 snap-start relative border rounded-xl p-3 flex flex-col justify-between h-24 cursor-pointer transition-all shadow-xs ${
                            isSelected
                              ? "border-forest bg-forest/5 shadow-sm"
                              : "border-stone-line/60 bg-cream-light/70 hover:border-forest/40"
                          }`}
                        >
                          {/* Check dot indicator */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-forest fill-cream" />
                            </div>
                          )}

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-ink-soft block truncate pr-4">{bio.parameter}</span>
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-base font-bold text-ink leading-none">{bio.value}</span>
                              <span className="text-[8px] text-stone font-medium">{bio.unit}</span>
                            </div>
                          </div>

                          <div className={`self-start text-[7px] font-mono-accent tracking-widest px-1.5 py-0.5 rounded-full border uppercase ${getStatusStyles(bio.status)}`}>
                            {bio.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Mobile swipe hint */}
                  <div className="flex justify-between items-center text-[9px] font-mono-accent text-stone/60 pt-1">
                    <span>← Swipe flashcards →</span>
                    <span>Tap card to consult AI assistant</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
