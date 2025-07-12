
"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiryTimestamp: number;
}

export function CountdownTimer({ expiryTimestamp }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = expiryTimestamp - new Date().getTime();
    let timeLeft = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(new Date().getTime() > expiryTimestamp);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.hours <= 0 && newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  if (isExpired) {
      return (
        <div className="text-center text-muted-foreground text-sm">
            The review period has passed. Please contact support if you have not heard back.
        </div>
      )
  }

  return (
    <div className="flex justify-center items-center gap-4">
      {timerComponents.map((component, index) => (
        <div key={component.label} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold font-mono tracking-wider text-primary">
                {String(component.value).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{component.label}</span>
          </div>
          {index < timerComponents.length - 1 && <span className="text-3xl font-bold text-muted-foreground">:</span>}
        </div>
      ))}
    </div>
  );
}
