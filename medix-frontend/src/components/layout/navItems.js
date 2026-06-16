import {
  LayoutDashboard,
  Stethoscope,
  FolderHeart,
  Pill,
  MessageCircleHeart,
  User,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.symptoms, label: 'Symptom Checker', icon: Stethoscope },
  { to: ROUTES.records, label: 'Health Records', icon: FolderHeart },
  { to: ROUTES.medications, label: 'Medications', icon: Pill },
  { to: ROUTES.chat, label: 'AI Chat', icon: MessageCircleHeart },
  { to: ROUTES.profile, label: 'Profile', icon: User },
]
