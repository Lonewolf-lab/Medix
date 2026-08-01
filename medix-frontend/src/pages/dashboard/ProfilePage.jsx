import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { dashboardApi } from "@/api/dashboardApi";
import { motion, AnimatePresence } from "motion/react";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import { sortBiomarkersByPriority } from "@/utils/biomarkerUtils";
import {
  User,
  Mail,
  Calendar,
  Activity,
  LogOut,
  Cpu,
  MessageSquare,
  X,
  Send,
  CheckCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [biomarkers, setBiomarkers] = useState([]);
  const [selectedBios, setSelectedBios] = useState([]); // List of parameter names



  const loadProfileData = async () => {
    try {
      const summary = await dashboardApi.getSummary();
      setBiomarkers(sortBiomarkersByPriority(summary?.biomarkers || []));
    } catch (err) {
      // Gracefully handle 404 if no report exists
      if (err.status === 404) {
        setBiomarkers([]);
      } else {
        toast.error("Failed to load health indicators matrix.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
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
    if (biomarkers) {
      const selectedDetails = selectedBios
        .map((name) => biomarkers.find((b) => b.parameter === name))
        .filter(Boolean);
      
      window.dispatchEvent(new CustomEvent("medix:active-biomarkers", {
        detail: selectedDetails,
      }));
    } else {
      window.dispatchEvent(new CustomEvent("medix:active-biomarkers", {
        detail: [],
      }));
    }
  }, [selectedBios, biomarkers]);

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

  const getStatusColor = (status) => {
    const s = status?.toUpperCase();
    if (s === "HIGH" || s === "LOW" || s === "ABNORMAL") return "border-rose-500 text-rose-600 bg-rose-500/5";
    if (s === "BORDERLINE" || s === "WARNING") return "border-amber-500 text-amber-600 bg-amber-500/5";
    return "border-emerald-500 text-emerald-600 bg-emerald-500/5";
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-10 relative">
      {/* Header */}
      <div className="space-y-2">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-stone uppercase block">
          PATIENT DATABASE
        </span>
        <h1 className="font-display text-4xl uppercase tracking-tight text-ink leading-none">
          Profile Settings
        </h1>
        <p className="font-sans text-xs text-ink-soft max-w-md leading-relaxed">
          Manage patient records, demographics details, and compile live biomarker values directly into floating AI chatbot query scopes.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader label="Accessing patient profiles..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Profile demographics (Col span 4) */}
          <div className="lg:col-span-4 bg-cream-light/30 border border-stone-line/60 rounded-2xl p-5 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-stone-line/40">
              <div className="w-16 h-16 rounded-full bg-ink text-cream flex items-center justify-center text-2xl font-bold">
                {user?.name?.slice(0, 1).toUpperCase() || "P"}
              </div>
              <div>
                <h3 className="font-display text-md uppercase text-ink">{user?.name}</h3>
                <span className="text-[10px] font-mono-accent text-stone uppercase">Patient Member</span>
              </div>
            </div>

            {/* Fields list */}
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-stone flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-mono-accent text-stone uppercase leading-none">Email Address</p>
                  <p className="text-ink font-semibold mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-stone flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-mono-accent text-stone uppercase leading-none">Date of Birth</p>
                  <p className="text-ink font-semibold mt-1">
                    {user?.dob
                      ? new Date(user.dob).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-stone flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-mono-accent text-stone uppercase leading-none">Blood Group</p>
                  <p className="text-ink font-semibold mt-1">{user?.bloodGroup || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-full py-2.5 font-mono-accent text-[10px] tracking-widest text-rose-500 border border-rose-300/40 hover:bg-rose-500/10 rounded-xl transition-all uppercase flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {/* Right panel: Biomarker Matrix Grid (Col span 8) */}
          <div className="lg:col-span-8 bg-cream-light/20 border border-stone-line/60 rounded-2xl p-5 space-y-4">
            <div>
              <span className="font-mono-accent text-[9px] tracking-widest text-stone uppercase">
                INTERACTIVE BIOMARKER MATRIX
              </span>
              <p className="font-sans text-[11px] text-ink-soft leading-relaxed mt-1">
                Select biomarker cards below. Selected indicators will be compiled and injected directly into the clinical AI's context.
              </p>
            </div>

            {biomarkers.length === 0 ? (
              <div className="border border-dashed border-stone-line/60 rounded-xl p-8 text-center text-stone font-sans text-xs italic py-16">
                No active biomarkers loaded. Upload a lab report on the Dashboard page to build your interactive matrix.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sortBiomarkersByPriority(biomarkers).map((bio) => {
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
                        <span className="text-[11px] font-semibold text-ink-soft block truncate pr-5">
                          {bio.parameter}
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-lg font-bold text-ink leading-none">{bio.value}</span>
                          <span className="text-[8px] text-stone font-medium">{bio.unit}</span>
                        </div>
                      </div>

                      <div className={`self-start text-[7px] font-mono-accent tracking-widest px-2 py-0.5 rounded-full border uppercase ${getStatusColor(bio.status)}`}>
                        {bio.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
