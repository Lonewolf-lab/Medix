// The five Medix modules — single source of truth used by the landing
// scroller and the /features deep-dive page.
export const FEATURES = [
  {
    id: "triage",
    title: "AI Symptom Triage",
    tagline: "A structured first opinion — not a panic spiral.",
    description:
      "Tell Medix what you feel. It weighs your symptoms against your age, history and active medications, then returns a calm, structured assessment — severity, likely causes, and what to do next.",
    details: [
      "Severity graded LOW → URGENT, always explained",
      "Possible causes ranked in plain language",
      "Personalized by your age, blood group & medications",
      "Every check saved to your symptom history",
    ],
    label: "FIRST OPINION",
  },
  {
    id: "records",
    title: "Health Records",
    tagline: "Every report, one calm archive.",
    description:
      "Upload lab reports, prescriptions and vaccination files as PDF or photo. Medix organizes them, reads them, explains them in plain words — and lets you chat with any single document.",
    details: [
      "PDF & image uploads, organized by type",
      "AI analysis of any document on demand",
      "Ask questions to a specific report in chat",
      "Your originals stay downloadable, always",
    ],
    label: "ORGANIZED",
  },
  {
    id: "medications",
    title: "Medications",
    tagline: "Never lose track of a course again.",
    description:
      "Track every medication with doses, schedules and reminders. Photograph a prescription and Medix extracts the medicines for you — you review, confirm, done.",
    details: [
      "AI prescription extraction from photo or PDF",
      "Multiple daily reminder times per medicine",
      "Course expiry detection — continue or stop",
      "Full history of past medications",
    ],
    label: "ON SCHEDULE",
  },
  {
    id: "chat",
    title: "AI Health Chat",
    tagline: "An assistant that actually knows you.",
    description:
      "Not a generic chatbot. Medix chat knows your age, blood group, active medications and recent symptoms — so every answer is grounded in your real health context.",
    details: [
      "Answers personalized by your live health profile",
      "Context panel shows exactly what the AI knows",
      "History kept until you clear it",
      "Clear medical disclaimers on every response",
    ],
    label: "CONTEXT-AWARE",
  },
  {
    id: "dashboard",
    title: "Lab Dashboard",
    tagline: "Your bloodwork, decoded.",
    description:
      "Upload a lab report and Medix extracts every biomarker — value, normal range, status — color-codes them, and explains each one. Tap any marker to ask the AI about it.",
    details: [
      "Automatic biomarker extraction from reports",
      "Green / amber / red status at a glance",
      "Plain-English explanation per marker",
      "Chat about any single biomarker's meaning",
    ],
    label: "DECODED",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Create your space",
    text: "Sign up with your basics — age, blood group. That's the seed of your health context. Everything Medix tells you is calibrated to it.",
  },
  {
    n: "02",
    title: "Upload & log",
    text: "Drop in lab reports and prescriptions, log symptoms as they happen, add your medications. Medix reads, extracts and organizes all of it.",
  },
  {
    n: "03",
    title: "Ask anything",
    text: "Triage a symptom, decode a biomarker, question a document. The AI answers with your full history in mind — calmly, with sources you can act on.",
  },
];
