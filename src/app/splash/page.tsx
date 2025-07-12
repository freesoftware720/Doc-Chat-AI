
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/icons';
import { motion } from 'framer-motion';

// Generates a random position for a star
const randomPosition = () => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
});

// Generates a random size for a star
const randomSize = () => {
  const size = Math.random() * 2 + 1;
  return { width: `${size}px`, height: `${size}px` };
};

// Generates a random animation delay for a star
const randomDelay = () => ({
  animationDelay: `${Math.random() * 5}s`,
});

export default function SplashScreen() {
  const router = useRouter();
  const [stars, setStars] = useState<any[]>([]);

  // Generate stars on mount
  useEffect(() => {
    const generatedStars = Array.from({ length: 100 }).map(() => ({
      pos: randomPosition(),
      size: randomSize(),
      delay: randomDelay(),
    }));
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.replace('/app');
      } else {
        router.replace('/auth/login');
      }
    }, 4000); // 4 seconds for the splash screen

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background overflow-hidden relative">
      {/* Aurora Background Effect */}
      <div 
        className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-20"
        style={{
          backgroundSize: '400% 400%',
          animation: 'move-aurora 15s ease infinite',
        }}
      />

      {/* Starfield Background */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, index) => (
          <div
            key={index}
            className="star"
            style={{ ...star.pos, ...star.size, ...star.delay }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        className="text-center relative z-10"
      >
        <motion.div
            style={{ animation: 'pulse-logo 3s ease-in-out infinite' }}
        >
          <Logo className="h-24 w-24 mx-auto" />
        </motion.div>
        <motion.h1 
          className="mt-6 text-4xl font-bold font-headline tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          Doc-Chat AI
        </motion.h1>
        <motion.p
            className="mt-2 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        >
            Loading your workspace...
        </motion.p>
      </motion.div>
    </div>
  );
}
