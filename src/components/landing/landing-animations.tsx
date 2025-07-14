
'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingAnimations() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Section Animation
      gsap.from(".gsap-hero-el", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });

      // General Fade-in for section headers
      gsap.utils.toArray<HTMLElement>('.gsap-fade-in').forEach(el => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 1,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Staggered animation for pricing cards
      gsap.from(".gsap-pricing-card", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#pricing",
          start: "top 70%",
          toggleActions: "play none none none",
        }
      });
      
      // Staggered animation for FAQ items
      gsap.from(".gsap-faq-item", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#faq",
          start: "top 75%",
          toggleActions: "play none none none",
        }
      });
      
      // Animation for individual review cards
      gsap.utils.toArray<HTMLElement>('.gsap-review-card').forEach(card => {
        gsap.from(card, {
          opacity: 0,
          scale: 0.9,
          duration: 1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        });
      });

    });

    return () => ctx.revert();
  }, []);

  return null;
}
