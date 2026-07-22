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
  Pill
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

  // Agenda Modal State
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);

  // Scheduler Form Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: "",
    specialty: "",
    time: "10:00",
    notes: "",
  });

  useEffect(() => {
    fetchData();
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

  // Helper: Get days in a month grid (42 cells: 6 rows of 7)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startOffset = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // Previous month offset days
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const endOffset = 42 - days.length;
    for (let i = 1; i <= endOffset; i++) {
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
          });
        }
      });
    }

    return events.sort((a, b) => a.primaryTime.localeCompare(b.primaryTime));
  };

  // Handle Day Click
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsAgendaModalOpen(true);
  };

  // Open Scheduler drawer
  const handleOpenScheduler = (appt = null) => {
    setIsAgendaModalOpen(false);
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
      setIsAgendaModalOpen(false);
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedDayEvents = getEventsForDate(selectedDate, filterType);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group days into 6 week rows to check if any week row is completely empty
  const weekRowHasEvents = [0, 1, 2, 3, 4, 5].map((rowIndex) => {
    const rowDays = days.slice(rowIndex * 7, (rowIndex + 1) * 7);
    return rowDays.some((item) => getEventsForDate(item.date, "ALL").length > 0);
  });

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatLongDate = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
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
        <div className="space-y-10">
          
          {/* SPACIOUS RECTANGULAR GRID CALENDAR */}
          <div className="bg-cream-light border border-stone-line rounded-2xl p-6 md:p-8 shadow-sm">
            
            {/* Header Controls */}
            <div className="flex flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-line/60">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-ink">
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
                  className="p-3 border border-stone-line rounded-xl hover:bg-stone-line/20 transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-3 border border-stone-line rounded-xl hover:bg-stone-line/20 transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-3 text-center font-mono-accent text-xs font-semibold text-stone uppercase tracking-widest mb-4 pb-2 border-b border-stone-line/50">
              {weekDays.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Big Rectangular Box Grid */}
            <div className="grid grid-cols-7 gap-3">
              {days.map((item, idx) => {
                const active = isSameDay(item.date, selectedDate);
                const today = isSameDay(item.date, new Date());
                const dayEvents = getEventsForDate(item.date, "ALL");

                const rowIndex = Math.floor(idx / 7);
                const isRowEmpty = !weekRowHasEvents[rowIndex];

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(item.date)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isRowEmpty
                        ? "min-h-[75px] md:min-h-[85px]"
                        : "min-h-[110px] md:min-h-[125px]"
                    } ${
                      active
                        ? "bg-cream-light border-2 border-forest ring-2 ring-forest/30 shadow-md"
                        : item.isCurrentMonth
                        ? "bg-cream border-stone-line/80 hover:border-stone text-ink hover:shadow-sm"
                        : "bg-cream/40 border-stone-line/30 text-stone/40 hover:bg-cream/60"
                    }`}
                  >
                    {/* Top Row: Date Number */}
                    <div className="flex justify-between items-center w-full mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          today
                            ? "bg-forest text-cream-light px-2.5 py-0.5 rounded-md font-bold"
                            : active
                            ? "text-forest font-bold text-base"
                            : "text-ink font-mono-accent"
                        }`}
                      >
                        {item.date.getDate()}
                      </span>

                      {today && !active && (
                        <span className="w-2 h-2 rounded-full bg-forest" />
                      )}
                    </div>

                    {/* Content Event Tags (Max 2 visible items shown, +X more if overflowing) */}
                    {dayEvents.length > 0 && (
                      <div className="flex flex-col gap-1.5 overflow-hidden flex-1 justify-end mt-1">
                        {dayEvents.slice(0, 2).map((ev, evIdx) => (
                          <div
                            key={evIdx}
                            className={`text-[10px] md:text-[11px] font-mono-accent px-2.5 py-1 rounded-lg border truncate flex items-center justify-between ${
                              ev.type === "appointment"
                                ? "bg-ink text-cream-light border-ink"
                                : "bg-forest/15 text-forest border-forest/30 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {ev.type === "appointment" ? (
                                <Stethoscope className="w-3 h-3 shrink-0" />
                              ) : (
                                <Pill className="w-3 h-3 shrink-0" />
                              )}
                              <span className="truncate">{ev.title}</span>
                            </div>
                            <span className="text-[9px] opacity-80 ml-1 shrink-0 font-bold">{ev.time}</span>
                          </div>
                        ))}

                        {dayEvents.length > 2 && (
                          <span className="text-[10px] font-mono-accent text-stone italic pl-1">
                            +{dayEvents.length - 2} more items
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ULTRA-SLEEK DAY AGENDA POPUP MODAL */}
      <AnimatePresence>
        {isAgendaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAgendaModalOpen(false)}
              className="fixed inset-0 bg-ink/75 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-cream-light border border-stone-line shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[82vh] z-50 my-auto"
            >
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-stone-line bg-cream flex justify-between items-center flex-shrink-0">
                <div>
                  <span className="font-mono-accent text-[10px] text-forest uppercase tracking-widest block">
                    Daily Schedule
                  </span>
                  <h3 className="font-display text-xl uppercase tracking-wide text-ink mt-0.5">
                    {formatLongDate(selectedDate)}
                  </h3>
                </div>

                <button
                  onClick={() => setIsAgendaModalOpen(false)}
                  className="p-1.5 rounded-full border border-stone-line/60 hover:bg-stone-line/30 transition-colors text-ink cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal Segmented Filter Bar */}
              <div className="px-6 py-2.5 border-b border-stone-line/60 bg-cream-light flex-shrink-0">
                <div className="flex items-center justify-between gap-1 bg-cream border border-stone-line/60 p-1 rounded-xl">
                  {[
                    { id: "ALL", label: "All Items" },
                    { id: "MEDICATIONS", label: "Medications" },
                    { id: "APPOINTMENTS", label: "Doctor Visits" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterType(tab.id)}
                      className={`relative flex-1 py-1.5 text-center text-xs font-mono-accent uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        filterType === tab.id
                          ? "text-cream-light font-bold"
                          : "text-stone hover:text-ink"
                      }`}
                    >
                      {filterType === tab.id && (
                        <motion.div
                          layoutId="calFilterBgModalFixed"
                          className="absolute inset-0 bg-ink rounded-lg shadow-xs"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      <span className="relative z-10 truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Event Row Items Container with Scrollbar */}
              <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-cream border border-stone-line flex items-center justify-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-stone/50" />
                    </div>
                    <p className="font-mono-accent text-xs text-stone italic">
                      No scheduled items for this date.
                    </p>
                    <button
                      onClick={() => handleOpenScheduler()}
                      className="mt-3 px-3.5 py-1.5 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-xs font-mono-accent transition-colors cursor-pointer"
                    >
                      + Schedule Appointment
                    </button>
                  </div>
                ) : (
                  selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-2xs hover:border-forest ${
                        ev.type === "appointment"
                          ? "bg-ink text-cream-light border-ink"
                          : "bg-cream border-stone-line/70 text-ink"
                      }`}
                    >
                      {/* Left: Independent Vector Icon + Title & Subtitle */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0">
                          {ev.type === "appointment" ? (
                            <Stethoscope className="w-5 h-5 text-forest-bright" />
                          ) : (
                            <Pill className="w-5 h-5 text-forest" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`font-display text-base uppercase tracking-tight truncate ${
                              ev.type === "appointment" ? "text-cream-light" : "text-ink"
                            }`}
                          >
                            {ev.title}
                          </h4>
                          <p
                            className={`text-[11px] font-mono-accent truncate mt-0.5 ${
                              ev.type === "appointment" ? "text-stone" : "text-forest"
                            }`}
                          >
                            {ev.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Time Badge & Edit Actions (if appointment) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`px-2.5 py-1.5 rounded-lg font-mono-accent text-xs font-bold text-center ${
                            ev.type === "appointment"
                              ? "bg-forest text-cream-light"
                              : "bg-forest/15 text-forest border border-forest/30"
                          }`}
                        >
                          {ev.time}
                        </div>

                        {ev.type === "appointment" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenScheduler(ev.raw)}
                              className="text-stone hover:text-cream-light transition-colors p-1 cursor-pointer"
                              title="Edit appointment"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(ev.raw ? ev.raw.id : ev.id)}
                              className="text-stone hover:text-red-400 transition-colors p-1 cursor-pointer"
                              title="Cancel appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Bar */}
              <div className="px-6 py-3.5 border-t border-stone-line bg-cream flex items-center justify-between flex-shrink-0">
                <span className="font-mono-accent text-[11px] text-stone">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "Entry" : "Entries"} scheduled
                </span>
                <button
                  onClick={() => handleOpenScheduler()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-cream-light font-mono-accent text-xs tracking-wider uppercase hover:bg-forest-bright shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule Visit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
