
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause } from 'lucide-react';

const waveSurferOptions = (container: HTMLElement) => ({
  container,
  waveColor: 'hsl(var(--muted-foreground))',
  progressColor: 'hsl(var(--primary))',
  cursorColor: 'hsl(var(--primary))',
  barWidth: 3,
  barGap: 2,
  barRadius: 3,
  responsive: true,
  height: 100,
  normalize: true,
});

export function WaveformPlayer({ audioUrl }: { audioUrl: string }) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    const ws = WaveSurfer.create(waveSurferOptions(waveformRef.current));
    wavesurfer.current = ws;

    ws.load(audioUrl);

    const onReady = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFinish = () => setIsPlaying(false);

    ws.on('ready', onReady);
    ws.on('play', onPlay);
    ws.on('pause', onPause);
    ws.on('finish', onFinish);

    // Cleanup
    return () => {
      ws.un('ready', onReady);
      ws.un('play', onPlay);
      ws.un('pause', onPause);
      ws.un('finish', onFinish);
      ws.destroy();
    };
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  }, []);

  return (
    <div className="w-full bg-muted/50 rounded-2xl p-4 flex items-center gap-4 border border-border/50">
      <Button
        onClick={handlePlayPause}
        size="icon"
        variant="ghost"
        disabled={isLoading}
        className="rounded-full w-14 h-14 bg-primary/20 text-primary hover:bg-primary/30"
      >
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </Button>
      <div ref={waveformRef} className="w-full h-[100px]" />
    </div>
  );
};
