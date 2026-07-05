import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { motion } from "motion/react";
import {
  Activity,
  FileText,
  Pill,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const mockStats = [
    { label: "Active Medications", value: "3 Course", desc: "1 expiring soon", icon: Pill, color: "text-forest" },
    { label: "Uploaded Records", value: "12 Docs", desc: "Last: 2 days ago", icon: FileText, color: "text-ink" },
    { label: "Symptom Status", value: "Mild Triage", desc: "Done on 3 July", icon: Activity, color: "text-stone" },
  ];

  const mockBiomarkers = [
    { parameter: "Vitamin D", value: "18", unit: "ng/mL", status: "LOW", color: "bg-rose-500/10 text-rose-600 border-rose-200" },
    { parameter: "Blood Glucose", value: "95", unit: "mg/dL", status: "NORMAL", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    { parameter: "Total Cholesterol", value: "210", unit: "mg/dL", status: "BORDERLINE", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  ];

  return (
    <div className="p-6 space-y-10">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <span className="font-mono-accent text-xs tracking-widest text-stone uppercase">PERSONAL SPACE</span>
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-ink">
          Welcome back, {user?.name || "Member"}.
        </h1>
        <p className="font-sans text-ink-soft max-w-xl text-sm leading-relaxed">
          Your personal health space is synchronized. Review your biomarker stats, manage active prescriptions, or check symptoms with your AI health assistant.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-cream-light/60 border border-stone-line/60 rounded-xl p-5 hover:border-stone/60 hover:shadow-sm transition-all duration-300 flex items-start justify-between"
            >
              <div className="space-y-1">
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase">{stat.label}</span>
                <p className="text-2xl font-semibold text-ink">{stat.value}</p>
                <span className="text-xs text-ink-soft block">{stat.desc}</span>
              </div>
              <div className={`p-3 rounded-full bg-stone-line/20 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Biomarker highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biomarkers Summary Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-line/60 pb-3">
            <h3 className="font-display text-md uppercase tracking-wider text-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest" />
              Biomarker Overview
            </h3>
            <span className="font-mono-accent text-[10px] tracking-widest text-stone">FROM LATEST REPORT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockBiomarkers.map((bio) => (
              <div
                key={bio.parameter}
                className="bg-cream-light/40 border border-stone-line/40 rounded-xl p-4 flex flex-col justify-between h-36"
              >
                <div>
                  <span className="text-xs font-medium text-ink-soft block">{bio.parameter}</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-semibold text-ink">{bio.value}</span>
                    <span className="text-xs text-stone">{bio.unit}</span>
                  </div>
                </div>
                <div className={`self-start text-[9px] font-mono-accent tracking-widest px-2.5 py-1 rounded-full border ${bio.color}`}>
                  {bio.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-line/60 pb-3">
            <h3 className="font-display text-md uppercase tracking-wider text-ink">Quick Actions</h3>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/records"
              className="group flex items-center justify-between p-4 bg-ink text-cream-light hover:bg-forest rounded-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-stone" />
                <span className="font-sans text-xs tracking-wide">Upload Lab Report</span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone group-hover:text-cream-light transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

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
    </div>
  );
}
