
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface AdRendererProps {
    adCode: string | null;
    className?: string;
}

export function AdRenderer({ adCode, className }: AdRendererProps) {
    const adContainerRef = useRef<HTMLDivElement>(null);
    // Add a key to force re-rendering when the ad code changes
    const [key, setKey] = useState(Date.now());

    useEffect(() => {
        // When the ad code changes, we update the key to ensure the component re-mounts
        // and cleans up any old ad scripts correctly.
        setKey(Date.now());
    }, [adCode]);

    useEffect(() => {
        if (!adCode || !adContainerRef.current) {
            return;
        }

        const adContainer = adContainerRef.current;
        // A temporary div is used to parse the ad code string into DOM nodes.
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adCode;

        // Move all parsed nodes (like <ins>, <div>, etc.) into the real container.
        while (tempDiv.firstChild) {
            adContainer.appendChild(tempDiv.firstChild);
        }

        // Find all the script tags that were just added.
        const scripts = adContainer.getElementsByTagName("script");
        
        // Re-create each script tag to force the browser to execute it.
        // This is necessary because scripts inserted via innerHTML are not run for security reasons.
        for (let i = 0; i < scripts.length; i++) {
            const oldScript = scripts[i];
            const newScript = document.createElement("script");

            // Copy all attributes (like src, async, etc.) from the original script.
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy the content for any inline scripts.
            if (oldScript.innerHTML) {
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            }

            // Replace the non-executable script with the new, executable one.
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        }

    }, [adCode, key]); // Re-run this effect if the ad code or our key changes.

    if (!adCode) {
        return null;
    }

    // The key prop on this div is crucial. It tells React to create a fresh component
    // instance whenever the ad changes, ensuring proper cleanup.
    return (
        <div
            key={key}
            ref={adContainerRef}
            className={cn('flex justify-center items-center text-muted-foreground text-sm min-h-[50px] w-full', className)}
        />
    );
}
