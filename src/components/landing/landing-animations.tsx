'use client';

import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function LandingAnimations() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#interactive-demo',
                start: 'top top',
                end: '+=4000',
                scrub: 1.5,
                pin: true,
            },
        });

        // Initial fade-in
        tl.from('#demo-browser-frame', { opacity: 0, scale: 0.9, duration: 1, ease: 'power2.out' });
        tl.from('#demo-cursor', { opacity: 0, scale: 0, duration: 0.5 }, "-=0.5");
        
        // --- 1. Move to Documents ---
        tl.to('#demo-cursor', { left: '80px', top: '130px', duration: 1, ease: 'power1.inOut' });
        tl.to('#demo-cursor', { scale: 0.8, duration: 0.2, yoyo: true, repeat: 1 }); // Simulate click
        tl.set('#sidebar-btn-dashboard', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare' });
        tl.set('#sidebar-btn-docs', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare font-medium border-primary/40 bg-primary/20 text-primary dark:text-white [text-shadow:0_0_8px_hsl(var(--primary))] dark:[text-shadow:0_0_8px_white]' });
        tl.to('#view-dashboard', { opacity: 0, x: -50, duration: 0.5, ease: 'power2.in' });
        tl.fromTo('#view-docs', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, "-=0.3");

        tl.addPause("+=1");

        // --- 2. Move to Chat History ---
        tl.to('#demo-cursor', { left: '80px', top: '170px', duration: 1, ease: 'power1.inOut' });
        tl.to('#demo-cursor', { scale: 0.8, duration: 0.2, yoyo: true, repeat: 1 });
        tl.set('#sidebar-btn-docs', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare' });
        tl.set('#sidebar-btn-history', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare font-medium border-primary/40 bg-primary/20 text-primary dark:text-white [text-shadow:0_0_8px_hsl(var(--primary))] dark:[text-shadow:0_0_8px_white]' });
        tl.to('#view-docs', { opacity: 0, x: -50, duration: 0.5, ease: 'power2.in' });
        tl.fromTo('#view-history', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, "-=0.3");

        tl.addPause("+=1");

        // --- 3. Move to Settings ---
        tl.to('#demo-cursor', { left: '80px', top: '210px', duration: 1, ease: 'power1.inOut' });
        tl.to('#demo-cursor', { scale: 0.8, duration: 0.2, yoyo: true, repeat: 1 });
        tl.set('#sidebar-btn-history', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare' });
        tl.set('#sidebar-btn-settings', { className: 'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all border border-transparent focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:[&>span]:hidden [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 interactive-glare font-medium border-primary/40 bg-primary/20 text-primary dark:text-white [text-shadow:0_0_8px_hsl(var(--primary))] dark:[text-shadow:0_0_8px_white]' });
        tl.to('#view-history', { opacity: 0, x: -50, duration: 0.5, ease: 'power2.in' });
        tl.fromTo('#view-settings', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, "-=0.3");

        // --- Fade out cursor at the end ---
        tl.to('#demo-cursor', { opacity: 0, scale: 0, duration: 0.5 }, "+=1");
    });
    
    // Fallback for smaller screens, simple fade-in
    mm.add("(max-width: 767px)", () => {
        gsap.from('#interactive-demo', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '#interactive-demo',
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        });
    });

    return () => mm.revert();
  }, []);

  return null;
}
