'use client';

import React, { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ReviewCard } from './review-card';
import type { ReviewWithProfile } from '@/app/actions/reviews';
import { cn } from '@/lib/utils';

const defaultContent = {
    headline: "What Our Users Say",
    subheadline: "Trusted by students, professionals, and researchers worldwide.",
};

export function ReviewsSection({ reviews, content = defaultContent }: { reviews: ReviewWithProfile[], content?: typeof defaultContent }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
        Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true }),
    ]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!reviews || reviews.length === 0) {
        return null; // Don't render the section if there are no reviews
    }

    // Duplicate reviews for a seamless loop effect, ensuring there are enough items
    const extendedReviews = reviews.length < 5 ? [...reviews, ...reviews, ...reviews] : reviews;

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index);
        emblaApi?.plugins()?.autoplay?.stop();
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        emblaApi?.plugins()?.autoplay?.play();
    };

    return (
        <section id="reviews" className="py-20 md:py-32">
             <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16 gsap-fade-in">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{content.headline}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{content.subheadline}</p>
                </div>
            </div>
            <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                    {extendedReviews.map((review, index) => (
                        <div 
                            className={cn(
                                "embla__slide transition-all duration-300 ease-in-out",
                                hoveredIndex !== null && hoveredIndex !== index ? "blur-[2px] opacity-60" : "",
                                hoveredIndex === index ? "scale-105 z-10" : ""
                            )} 
                            key={`${review.id}-${index}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <ReviewCard review={review} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
