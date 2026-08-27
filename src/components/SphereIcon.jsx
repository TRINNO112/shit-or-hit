import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Home,
  PartyPopper,
  Users,
  Dumbbell,
  Rocket,
  Brain,
  Heart,
  Laptop,
  BookOpen,
  Coffee,
  Flame,
  Zap,
  Target,
  Music,
  Sparkles,
  Layers,
  Smile,
  Compass,
  Building,
  Shield,
  Activity,
  Award
} from 'lucide-react';

export const SPHERE_INFOGRAPHIC_ICONS = [
  { id: 'GraduationCap', label: 'Academics', icon: GraduationCap },
  { id: 'Briefcase', label: 'Work & Office', icon: Briefcase },
  { id: 'Home', label: 'Home Sanctuary', icon: Home },
  { id: 'PartyPopper', label: 'Social & Events', icon: PartyPopper },
  { id: 'Users', label: 'Network & Friends', icon: Users },
  { id: 'Dumbbell', label: 'Fitness & Gym', icon: Dumbbell },
  { id: 'Rocket', label: 'Side Hustle / Growth', icon: Rocket },
  { id: 'Brain', label: 'Deep Focus & Study', icon: Brain },
  { id: 'Heart', label: 'Health & Wellness', icon: Heart },
  { id: 'Laptop', label: 'Coding & Tech', icon: Laptop },
  { id: 'BookOpen', label: 'Reading & Wisdom', icon: BookOpen },
  { id: 'Coffee', label: 'Lifestyle & Routine', icon: Coffee },
  { id: 'Flame', label: 'High Intensity', icon: Flame },
  { id: 'Zap', label: 'Energy & Momentum', icon: Zap },
  { id: 'Target', label: 'Goals & Targets', icon: Target },
  { id: 'Music', label: 'Creative & Arts', icon: Music },
  { id: 'Sparkles', label: 'Peak Velocity', icon: Sparkles },
  { id: 'Award', label: 'Achievements', icon: Award }
];

const EMOJI_TO_ICON_MAP = {
  '🎓': GraduationCap,
  '🏢': Briefcase,
  '💼': Briefcase,
  '🏫': GraduationCap,
  '🏠': Home,
  '🛋️': Home,
  '🏡': Home,
  '🎉': PartyPopper,
  '🎈': PartyPopper,
  '👥': Users,
  '🏋️': Dumbbell,
  '💪': Dumbbell,
  '🚀': Rocket,
  '🧠': Brain,
  '💡': Zap,
  '⚡': Zap,
  '❤️': Heart,
  '💻': Laptop,
  '📚': BookOpen,
  '📖': BookOpen,
  '☕': Coffee,
  '🔥': Flame,
  '🎯': Target,
  '🎵': Music,
  '✨': Sparkles
};

const NAME_TO_ICON_MAP = {
  GraduationCap,
  Briefcase,
  Home,
  PartyPopper,
  Users,
  Dumbbell,
  Rocket,
  Brain,
  Heart,
  Laptop,
  BookOpen,
  Coffee,
  Flame,
  Zap,
  Target,
  Music,
  Sparkles,
  Layers,
  Smile,
  Compass,
  Building,
  Shield,
  Activity,
  Award
};

export default function SphereIcon({ icon, className = "w-4 h-4", style }) {
  if (!icon) {
    return <Sparkles className={className} style={style} />;
  }

  // 1. Direct Lucide Icon name lookup
  if (typeof icon === 'string' && NAME_TO_ICON_MAP[icon]) {
    const Component = NAME_TO_ICON_MAP[icon];
    return <Component className={className} style={style} />;
  }

  // 2. Legacy emoji string mapping
  if (typeof icon === 'string' && EMOJI_TO_ICON_MAP[icon]) {
    const Component = EMOJI_TO_ICON_MAP[icon];
    return <Component className={className} style={style} />;
  }

  // 3. Fallback to Sparkles
  return <Sparkles className={className} style={style} />;
}
