import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit3,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Pill,
  Bell
} from "lucide-react";
import { appointmentApi } from "../../api/appointmentApi";
import { medicationApi } from "../../api/medicationApi";
import toast from "react-hot-toast";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL"); // ALL | APPOINTMENTS | MEDICATIONS



  // Scheduler Form Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: "",
    specialty: "",
    time: "10:00",
    notes: "",
  });

  // Medication Timings Modal State
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [newMedReminderTime, setNewMedReminderTime] = useState("");

  useEffect(() => {
    fetchData();

    const handleScheduleUpdate = () => {
      fetchData();
    };

    window.addEventListener("medix:schedule-updated", handleScheduleUpdate);
    return () => {
      window.removeEventListener("medix:schedule-updated", handleScheduleUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsData, medsData] = await Promise.all([
        appointmentApi.getAll(),
        medicationApi.getAll(),
      ]);
      setAppointments(apptsData || []);
      setMedications(medsData || []);
    } catch (err) {
      toast.error("Failed to load calendar events.");
    } finally {
      setLoading(false);
    }
  };

  // Default time generator based on FrequencyType when no specific reminders are saved
  const getDefaultTimesForFrequency = (frequency) => {
    switch (frequency) {
      case "TWICE_DAILY":
        return ["09:00", "21:00"];
      case "THREE_TIMES_DAILY":
        return ["08:00", "14:00", "20:00"];
      case "WEEKLY":
      case "AS_NEEDED":
      case "ONCE_DAILY":
      default:
        return ["09:00"];
    }
  };

  // Helper: Get days in a month grid (padded to multiple of 5 columns)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to keep neat 5-column grid layout
    const totalCells = Math.ceil(days.length / 5) * 5;
    const paddingCount = totalCells - days.length;
    for (let i = 1; i <= paddingCount; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now);
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // String YYYY-MM-DD date check (only shows active, non-expired medications for today & future dates)
  const isMedicationActiveOnDate = (med, targetDate) => {
    // Safely check active & expired status (Jackson serializes Java boolean isActive getter as JSON 'active')
    const isActive = med.active !== undefined ? med.active : med.isActive;
    const isExpired = med.expired !== undefined ? med.expired : med.isExpired;

    if (isActive === false || isExpired === true) return false;

    const todayObj = new Date();
    const todayYMD =
      todayObj.getFullYear() +
      "-" +
      String(todayObj.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(todayObj.getDate()).padStart(2, "0");

    const targetYMD =
      targetDate.getFullYear() +
      "-" +
      String(targetDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(targetDate.getDate()).padStart(2, "0");

    // Do NOT display medications for dates that have passed
    if (targetYMD < todayYMD) return false;

    if (med.startDate && med.startDate > targetYMD) return false;
    if (med.endDate && med.endDate < targetYMD) return false;

    return true;
  };

  // Get events for a specific date
  const getEventsForDate = (targetDate, currentFilter = "ALL") => {
    const events = [];

    // 1. Doctor Appointments (retained for all dates, past and future, as a history log)
    if (currentFilter === "ALL" || currentFilter === "APPOINTMENTS") {
      appointments.forEach((appt) => {
        const apptTime = new Date(appt.appointmentTime);
        if (isSameDay(apptTime, targetDate)) {
          const tStr = apptTime.toTimeString().slice(0, 5);
          // Clean up any duplicate 'Dr. Dr. ' prefixes
          const formattedTitle = appt.doctorName
            ? appt.doctorName.replace(/^(Dr\.\s*)+/i, "Dr. ")
            : "Doctor Visit";

          events.push({
            id: `appt-${appt.id}`,
            type: "appointment",
            time: tStr,
            primaryTime: tStr,
            title: formattedTitle,
            subtitle: appt.specialty || "Doctor Visit",
            notes: appt.notes,
            raw: appt,
          });
        }
      });
    }

    // 2. Active Medications (Only shown for today & future dates; hidden for past dates)
    if (currentFilter === "ALL" || currentFilter === "MEDICATIONS") {
      medications.forEach((med) => {
        if (isMedicationActiveOnDate(med, targetDate)) {
          const times =
            med.reminders && med.reminders.length > 0
              ? med.reminders.map((r) => r.reminderTime)
              : getDefaultTimesForFrequency(med.frequency);

          // Join multiple reminder times into a range, e.g. "09:00 - 21:00"
          const timeDisplay = times.length > 1 ? times.join(" - ") : times[0] || "09:00";
          const firstTime = times[0] || "09:00";

          events.push({
            id: `med-${med.id}`,
            type: "medication",
            time: timeDisplay,
            primaryTime: firstTime,
            title: med.name,
            subtitle: `${med.dosage || "Prescription"} • ${
              med.frequency ? med.frequency.replace(/_/g, " ") : "DAILY"
            }`,
            notes: med.notes,
            raw: med,
          });
        }
      });
    }

    return events.sort((a, b) => a.primaryTime.localeCompare(b.primaryTime));
  };

  // Handle Day Click
  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  // Open Scheduler drawer
  const handleOpenScheduler = (appt = null) => {
    if (appt) {
      const apptTime = new Date(appt.appointmentTime);
      const hour = String(apptTime.getHours()).padStart(2, "0");
      const min = String(apptTime.getMinutes()).padStart(2, "0");

      setEditingAppointment(appt);
      setFormData({
        doctorName: appt.doctorName,
        specialty: appt.specialty || "",
        time: `${hour}:${min}`,
        notes: appt.notes || "",
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        doctorName: "",
        specialty: "",
        time: "10:00",
        notes: "",
      });
    }
    setIsDrawerOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorName.trim()) {
      toast.error("Doctor name is required");
      return;
    }

    try {
      const [hours, minutes] = formData.time.split(":");
      const appointmentTime = new Date(selectedDate);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const localIsoTime =
        appointmentTime.getFullYear() +
        "-" +
        String(appointmentTime.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(appointmentTime.getDate()).padStart(2, "0") +
        "T" +
        String(appointmentTime.getHours()).padStart(2, "0") +
        ":" +
        String(appointmentTime.getMinutes()).padStart(2, "0") +
        ":00";

      const payload = {
        doctorName: formData.doctorName,
        specialty: formData.specialty,
        appointmentTime: localIsoTime,
        notes: formData.notes,
      };

      if (editingAppointment) {
        await appointmentApi.update(editingAppointment.id, payload);
        toast.success("Appointment updated");
      } else {
        await appointmentApi.create(payload);
        toast.success("Appointment scheduled");
      }

      setIsDrawerOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save appointment");
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (apptId) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      // Strip 'appt-' prefix if present from event wrapper ID
      const cleanId = String(apptId).replace(/^appt-/, "");
      await appointmentApi.deleteAppointment(cleanId);
      toast.success("Appointment cancelled");
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleOpenMedTimingsModal = (med) => {
    setEditingMedication(med);
    setNewMedReminderTime("");
    setIsMedModalOpen(true);
  };

  const handleAddMedReminder = async (e) => {
    e.preventDefault();
    if (!newMedReminderTime || !editingMedication) return;

    try {
      const payload = { reminderTime: newMedReminderTime };
      const updated = await medicationApi.addReminder(editingMedication.id, payload);
      setEditingMedication(updated);
      toast.success("Reminder added");
      setNewMedReminderTime("");
      fetchData();
    } catch (err) {
      toast.error("Failed to add reminder");
    }
  };

  const handleDeleteMedReminder = async (reminderId) => {
    if (!editingMedication) return;
    try {
      await medicationApi.deleteReminder(editingMedication.id, reminderId);
      // Re-fetch current medication
      const updated = await medicationApi.getById(editingMedication.id);
      setEditingMedication(updated);
      toast.success("Reminder removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove reminder");
    }
  };

  const handleDeleteMedication = async (medId) => {
    if (!confirm("Are you sure you want to stop/delete this medication log?")) return;
    try {
      const cleanId = String(medId).replace(/^med-/, "");
      await medicationApi.deleteMedication(cleanId);
      toast.success("Medication tracker deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete medication");
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedDayEvents = getEventsForDate(selectedDate, filterType);
  // Group days into 5-day rows to check if any row is completely empty
  const numRows = Math.ceil(days.length / 5);
  const weekRowHasEvents = Array.from({ length: numRows }, (_, rowIndex) => {
    const rowDays = days.slice(rowIndex * 5, (rowIndex + 1) * 5);
    return rowDays.some((item) => getEventsForDate(item.date, "ALL").length > 0);
  });

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatLongDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const formatGridTime = (timeDisplay) => {
    if (!timeDisplay) return "";
    const parts = timeDisplay.split(" - ");
    if (parts.length > 1) {
      return `${parts[0]} (+${parts.length - 1})`;
    }
    return timeDisplay;
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 bg-cream text-ink font-sans max-w-7xl mx-auto w-full">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-line/60">
        <div>
          <div className="text-forest font-mono-accent text-xs tracking-widest uppercase">
            Interactive Health Calendar
          </div>
          <h1 className="font-display uppercase tracking-tight text-3xl md:text-5xl mt-1 text-ink">
            Health Calendar
          </h1>
        </div>

        <button
          onClick={() => handleOpenScheduler()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-cream-light font-mono-accent text-xs tracking-wider uppercase hover:bg-forest-bright shadow-xs transition-all transform active:scale-95 cursor-pointer self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Book Visit
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest" />
          <p className="font-mono-accent text-xs text-stone">Synchronizing schedules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Compact 5-column calendar (col-span 7) */}
          <div className="lg:col-span-7 bg-cream-light border border-stone-line rounded-2xl p-5 md:p-6 shadow-sm">
            
            {/* Header Controls */}
            <div className="flex flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-line/60">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wider text-ink">
                  {formatMonthYear(currentMonth)}
                </h2>
                <button
                  onClick={jumpToToday}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-line text-xs font-mono-accent text-stone hover:text-forest hover:border-forest transition-colors cursor-pointer"
                >
                  Today
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2.5 border border-stone-line rounded-xl hover:bg-stone-line/20 transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2.5 border border-stone-line rounded-xl hover:bg-stone-line/20 transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Big Rectangular Box Grid (Spacious 5-column wrap layout) */}
            <div className="grid grid-cols-5 gap-2.5">
              {days.map((item, idx) => {
                const active = isSameDay(item.date, selectedDate);
                const today = isSameDay(item.date, new Date());
                const dayEvents = getEventsForDate(item.date, "ALL");

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(item.date)}
                    className={`h-14 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? "bg-cream-light border-2 border-forest ring-2 ring-forest/30 shadow-xs"
                        : item.isCurrentMonth
                        ? "bg-cream border-stone-line/80 hover:border-stone text-ink hover:shadow-xs"
                        : "bg-cream/40 border-stone-line/30 text-stone/40 hover:bg-cream/60"
                    }`}
                  >
                    {/* Top Row: Date Number (Left) & Weekday Label (Right) */}
                    <div className="flex justify-between items-start w-full">
                      <span
                        className={`text-[11px] font-semibold px-1 py-0.5 rounded leading-none ${
                          today
                            ? "bg-forest text-cream-light font-bold"
                            : active
                            ? "text-forest font-bold bg-forest/10"
                            : "text-ink font-mono-accent"
                        }`}
                      >
                        {item.date.getDate()}
                      </span>
                      <span className="text-[8px] font-mono-accent text-stone uppercase font-bold pt-0.5">
                        {item.date.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </div>

                    {/* Event Indicator Icons (Stethoscope for Appointment, Pill for Medication) */}
                    <div className="flex gap-1 justify-center items-center h-3.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, evIdx) => (
                        <span key={evIdx} className="shrink-0">
                          {ev.type === "appointment" ? (
                            <Stethoscope className="w-3 h-3 text-ink/80" />
                          ) : (
                            <Pill className="w-3 h-3 text-forest/80" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Live Selected Day Agenda (col-span 5) */}
          <div className="lg:col-span-5 bg-cream-light border border-stone-line rounded-2xl p-5 md:p-6 shadow-sm flex flex-col min-h-[480px]">
            {/* Agenda Header */}
            <div className="flex justify-between items-start pb-4 border-b border-stone-line/60 mb-4">
              <div>
                <span className="font-mono-accent text-[9px] text-forest uppercase tracking-widest block">
                  Daily Schedule
                </span>
                <h3 className="font-display text-lg uppercase tracking-wide text-ink mt-0.5">
                  {formatLongDate(selectedDate)}
                </h3>
              </div>
              
              <button
                onClick={() => handleOpenScheduler()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest hover:bg-forest-bright text-cream-light font-mono-accent text-[9px] tracking-wider uppercase transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Visit
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-1 bg-cream border border-stone-line/60 p-1 rounded-xl mb-4 flex-shrink-0">
              {[
                { id: "ALL", label: "All Items" },
                { id: "MEDICATIONS", label: "Medications" },
                { id: "APPOINTMENTS", label: "Doctor Visits" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`relative flex-1 py-1 text-center text-[10px] font-mono-accent uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    filterType === tab.id
                      ? "text-cream-light font-bold"
                      : "text-stone hover:text-ink"
                  }`}
                >
                  {filterType === tab.id && (
                    <motion.div
                      layoutId="calFilterBgFixedRight"
                      className="absolute inset-0 bg-ink rounded-lg shadow-xs"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className="relative z-10 truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Event List Container */}
            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 custom-scrollbar max-h-[500px]">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-cream border border-stone-line flex items-center justify-center mb-2.5">
                    <CalendarIcon className="w-5 h-5 text-stone/50" />
                  </div>
                  <p className="text-xs font-semibold text-ink-soft">No Events</p>
                  <p className="text-[10px] text-stone max-w-[200px] mt-0.5 leading-relaxed">
                    No active prescriptions or doctor visits for this day.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 relative overflow-hidden group bg-cream hover:shadow-xs ${
                      ev.type === "appointment"
                        ? "border-stone-line/80 border-l-4 border-l-ink"
                        : "border-stone-line/80 border-l-4 border-l-forest"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        {/* Time */}
                        <div className="flex items-center gap-1.5 text-stone font-mono-accent text-[9px] uppercase tracking-wider">
                          <Clock className="w-3 h-3 text-stone" />
                          <span>{ev.time}</span>
                        </div>
                        {/* Title */}
                        <h4 className="font-display text-sm uppercase text-ink tracking-wide leading-snug">
                          {ev.title}
                        </h4>
                        {/* Subtitle */}
                        <p className="text-[11px] text-stone font-medium">
                          {ev.subtitle}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-cream-light border border-stone-line/50 flex items-center justify-center text-ink flex-shrink-0">
                        {ev.type === "appointment" ? (
                          <Stethoscope className="w-4 h-4 text-forest" />
                        ) : (
                          <Pill className="w-4 h-4 text-ink-soft" />
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {ev.notes && (
                      <p className="text-[11px] text-stone font-sans italic bg-cream-light px-2.5 py-1.5 rounded-lg border border-stone-line/40">
                        "{ev.notes}"
                      </p>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-end gap-1.5 border-t border-stone-line/40 pt-2.5 mt-0.5">
                      {ev.type === "appointment" ? (
                        <>
                          <button
                            onClick={() => handleOpenScheduler(ev.raw)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-line hover:border-forest text-stone hover:text-forest font-mono-accent text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Reschedule
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(ev.raw.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-line hover:border-rose-500 text-stone hover:text-rose-500 font-mono-accent text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenMedTimingsModal(ev.raw)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-line hover:border-forest text-stone hover:text-forest font-mono-accent text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Clock className="w-3 h-3" /> Timings
                          </button>
                          <button
                            onClick={() => handleDeleteMedication(ev.raw.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-line hover:border-rose-500 text-stone hover:text-rose-500 font-mono-accent text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Stop Tracker
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SLIDING SIDE PANEL (Scheduler Form Drawer) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-ink/70 backdrop-blur-xs z-50"
            />

            {/* Full Screen Length Sliding Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 h-screen h-full w-full max-w-md bg-cream-light border-l border-stone-line shadow-2xl z-50 p-6 md:p-8 flex flex-col justify-between overflow-y-auto rounded-none"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex justify-between items-start border-b border-stone-line pb-5 mb-6">
                  <div>
                    <span className="font-mono-accent text-[10px] text-forest uppercase tracking-widest">
                      Appointment Booking
                    </span>
                    <h3 className="font-display text-2xl uppercase tracking-wider text-ink mt-0.5">
                      {editingAppointment ? "Edit Visit" : "Schedule Visit"}
                    </h3>
                    <p className="text-xs text-stone font-mono-accent mt-1">
                      Date: {formatLongDate(selectedDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 border border-stone-line rounded-full hover:bg-stone-line/20 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                {/* Clean Aligned Form */}
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono-accent text-stone uppercase tracking-widest mb-2">
                      Doctor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. Sharma"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full bg-cream border border-stone-line rounded-xl px-4 py-3 text-sm text-ink font-sans focus:outline-none focus:border-forest transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-accent text-stone uppercase tracking-widest mb-2">
                      Specialty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, General Physician"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full bg-cream border border-stone-line rounded-xl px-4 py-3 text-sm text-ink font-sans focus:outline-none focus:border-forest transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-accent text-stone uppercase tracking-widest mb-2">
                      Time Slot
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-cream border border-stone-line rounded-xl px-4 py-3 text-sm text-ink font-sans focus:outline-none focus:border-forest transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-accent text-stone uppercase tracking-widest mb-2">
                      Notes / Instructions
                    </label>
                    <textarea
                      placeholder="Add key symptoms or questions you want to ask..."
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-cream border border-stone-line rounded-xl p-4 text-sm text-ink font-sans focus:outline-none focus:border-forest transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-forest text-cream-light font-mono-accent text-xs tracking-wider uppercase hover:bg-forest-bright shadow-sm transition-all cursor-pointer mt-8"
                  >
                    {editingAppointment ? "Save Changes" : "Confirm Appointment"}
                  </button>
                </form>
              </div>

              {editingAppointment && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteAppointment(editingAppointment.id);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-red-200 text-red-500 font-mono-accent text-xs tracking-wider uppercase hover:bg-red-500/10 transition-colors cursor-pointer mt-6"
                >
                  <Trash2 className="w-4 h-4" /> Cancel Appointment
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MEDICATIONS TIMINGS EDIT MODAL */}
      <AnimatePresence>
        {isMedModalOpen && editingMedication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMedModalOpen(false)}
              className="fixed inset-0 bg-ink/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-cream-light border border-stone-line shadow-2xl rounded-2xl p-6 overflow-hidden flex flex-col z-50 my-auto space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-stone-line/60">
                <div>
                  <span className="font-mono-accent text-[9px] text-forest uppercase tracking-widest block">
                    Edit Timings
                  </span>
                  <h3 className="font-display text-lg uppercase tracking-wide text-ink mt-0.5">
                    {editingMedication.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMedModalOpen(false)}
                  className="p-1.5 rounded-full border border-stone-line/60 hover:bg-stone-line/30 transition-colors text-ink cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Medication Details Card */}
              <div className="bg-cream border border-stone-line/50 p-4 rounded-xl space-y-1.5 text-xs text-ink-soft">
                <p>Dosage: <span className="font-semibold text-ink">{editingMedication.dosage}</span></p>
                <p>Frequency: <span className="font-semibold text-ink uppercase font-mono-accent">{editingMedication.frequency?.replace(/_/g, " ")}</span></p>
                {editingMedication.notes && (
                  <p className="italic text-[11px] mt-1 pt-1.5 border-t border-stone-line/30">
                    "{editingMedication.notes}"
                  </p>
                )}
              </div>

              {/* Reminders List & Add Form */}
              <div className="space-y-4">
                <span className="font-mono-accent text-[10px] tracking-widest text-stone uppercase block flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-forest" /> Current Reminders
                </span>

                {editingMedication.reminders?.length === 0 ? (
                  <p className="text-xs text-stone italic">No reminders set. Add one below.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {editingMedication.reminders?.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest/10 border border-forest/25 rounded-full text-xs text-forest font-semibold"
                      >
                        {r.reminderTime}
                        <button
                          onClick={() => handleDeleteMedReminder(r.id)}
                          className="hover:text-rose-500 cursor-pointer"
                          title="Remove reminder"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Time Form */}
                <form onSubmit={handleAddMedReminder} className="flex gap-2 pt-2">
                  <input
                    type="time"
                    required
                    value={newMedReminderTime}
                    onChange={(e) => setNewMedReminderTime(e.target.value)}
                    className="bg-cream border border-stone-line/60 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-forest"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-ink hover:bg-forest text-cream-light text-xs font-mono-accent rounded-xl transition-colors cursor-pointer"
                  >
                    Add Time
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-line/60 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="flex-1 py-3 border border-stone-line rounded-xl text-xs font-mono-accent uppercase tracking-wider text-ink hover:bg-stone-line/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteMedication(editingMedication.id);
                    setIsMedModalOpen(false);
                  }}
                  className="py-3 px-4 border border-rose-200 text-rose-500 rounded-xl text-xs font-mono-accent uppercase tracking-wider hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
