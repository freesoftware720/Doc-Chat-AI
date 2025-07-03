
'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingAnimations() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section load-in animation
      gsap.timeline()
        .from('.gsap-hero-el', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.2,
        });

      // General fade-in for section headers
      gsap.utils.toArray<HTMLElement>('.gsap-fade-in').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Staggered fade-in for feature cards
      gsap.from('.gsap-feature-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.gsap-feature-card',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
      
       // Staggered fade-in for pricing cards
      gsap.from('.gsap-pricing-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.gsap-pricing-card',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
      
      // Staggered fade-in for review cards
      gsap.from('.gsap-review-card', {
        scrollTrigger: {
          trigger: '.gsap-review-card',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 60,
        ease: 'power3.out',
        duration: 1,
        stagger: 0.1
      });


      // Staggered fade-in for FAQ items
      gsap.from('.gsap-faq-item', {
        opacity: 0,
        x: -30,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.gsap-faq-item',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Cleanup
    return () => ctx.revert();
  }, []);

  return null;
}
