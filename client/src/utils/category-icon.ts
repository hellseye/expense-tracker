import {
  Utensils,
  ShoppingBag,
  Bus,
  HeartPulse,
  Tv,
  Zap,
  DollarSign,
  Briefcase,
  GraduationCap,
  Plane,
  Home,
  Film,
  Dumbbell,
  Gift,
  Tag,
  LucideIcon
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  food: Utensils,
  shoppingbag: ShoppingBag,
  shopping: ShoppingBag,
  bus: Bus,
  transport: Bus,
  heartpulse: HeartPulse,
  health: HeartPulse,
  tv: Tv,
  entertainment: Tv,
  zap: Zap,
  bills: Zap,
  dollarsign: DollarSign,
  salary: DollarSign,
  briefcase: Briefcase,
  work: Briefcase,
  graduationcap: GraduationCap,
  education: GraduationCap,
  plane: Plane,
  travel: Plane,
  home: Home,
  housing: Home,
  film: Film,
  movies: Film,
  dumbbell: Dumbbell,
  fitness: Dumbbell,
  gift: Gift,
};

export function getCategoryIcon(iconOrName?: string): LucideIcon {
  if (!iconOrName) return Tag;
  const key = iconOrName.toLowerCase().replace(/[^a-z]/g, "");
  return ICON_MAP[key] || Tag;
}
