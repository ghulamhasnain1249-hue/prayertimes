export type Tab = 'prayer' | 'location' | 'qibla' | 'themes' | 'sun' | 'moon' | 'author';

export type ThemeType = 'default' | 'obsidian' | 'golden' | 'ocean' | 'emerald' | 'crimson' | 'noir';

export interface Theme {
  id: ThemeType;
  name: string;
  bg: string;
  accent: string;
}
