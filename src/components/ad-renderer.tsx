
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface AdRendererProps {
    adCode: string | null;
    className?: string;
}

export function AdRenderer({ adCode, className }: AdRendererProps) {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // We use a timer to ensure the container is in the DOM before manipulating it.
        const timer = setTimeout(() => {
            if (adCode && adContainerRef.current) {
                adContainerRef.current.innerHTML = adCode;
                
                const scripts = Array.from(adContainerRef.current.getElementsByTagName("script"));
                scripts.forEach((script) => {
                    const newScript = document.createElement("script");
                    newScript.innerHTML = script.innerHTML;
                    
                    for (let i = 0; i < script.attributes.length; i++) {
                        const attr = script.attributes[i];
                        newScript.setAttribute(attr.name, attr.value);
                    }
                    
                    script.parentNode?.replaceChild(newScript, script);
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [adCode]);

    if (!adCode) {
        return null;
    }

    return (
        <div
            ref={adContainerRef}
            className={cn('flex justify-center items-center text-muted-foreground text-sm min-h-[50px] w-full', className)}
        />
    );
}
