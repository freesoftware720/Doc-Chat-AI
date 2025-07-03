'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ count = 5, value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }, (_, i) => i + 1).map((starValue) => (
        <Star
          key={starValue}
          className={cn(
            'h-8 w-8 cursor-pointer transition-all duration-200',
            (hoverValue || value) >= starValue
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-muted-foreground'
          )}
          onClick={() => onChange(starValue)}
          onMouseEnter={() => setHoverValue(starValue)}
          onMouseLeave={() => setHoverValue(undefined)}
        />
      ))}
    </div>
  );
}
