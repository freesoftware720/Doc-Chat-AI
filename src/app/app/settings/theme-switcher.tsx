
'use client';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const themes = [
  { name: 'Default', value: 'default', colors: ['#0EA5E9', '#222831'] },
  { name: 'Green', value: 'green', colors: ['#4ade80', '#171717'] },
  { name: 'Orange', value: 'orange', colors: ['#f97316', '#171717'] },
  { name: 'Luxury', value: 'luxury', colors: ['#D4AF37', '#1C1C1E'] },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {themes.map((t) => (
        <button
          key={t.value}
          className={cn(
            'p-4 rounded-lg border-2 transition-all relative flex flex-col items-center justify-center gap-2',
            theme === t.value ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
          )}
          onClick={() => setTheme(t.value)}
        >
          {theme === t.value && (
            <div className="absolute top-2 right-2 p-1 bg-primary rounded-full text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {t.colors.map((color) => (
              <div
                key={color}
                className="h-6 w-6 rounded-full border border-border/50"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-sm font-medium">{t.name}</p>
        </button>
      ))}
    </div>
  );
}
