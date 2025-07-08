
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { ReviewWithProfile } from '@/app/actions/reviews';

export function ReviewCard({ review }: { review: ReviewWithProfile }) {
    const name = review.profiles?.full_name || 'Anonymous';
    const avatarUrl = review.profiles?.avatar_url;
    const fallback = name.charAt(0).toUpperCase();

    return (
        <div className="gsap-review-card p-2 h-full group">
            <Card className="relative h-full rounded-3xl shadow-2xl shadow-primary/10 bg-gradient-to-br from-card/60 to-card/20 border-white/10 overflow-hidden">
                
                {/* Animated Border Spans */}
                <span className="absolute top-0 left-1/2 block h-[1px] w-0 -translate-x-1/2 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:shadow-[0_0_6px_hsl(var(--primary))]"></span>
                <span className="absolute bottom-0 left-1/2 block h-[1px] w-0 -translate-x-1/2 bg-primary transition-all duration-300 ease-out group-hover:w-full group-hover:shadow-[0_0_6px_hsl(var(--primary))]"></span>
                <span className="absolute left-0 top-1/2 block h-0 w-[1px] -translate-y-1/2 bg-primary transition-all duration-300 ease-out group-hover:h-full group-hover:shadow-[0_0_6px_hsl(var(--primary))]"></span>
                <span className="absolute right-0 top-1/2 block h-0 w-[1px] -translate-y-1/2 bg-primary transition-all duration-300 ease-out group-hover:h-full group-hover:shadow-[0_0_6px_hsl(var(--primary))]"></span>

                <CardContent className="p-6 md:p-8 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
                            <AvatarFallback>{fallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{name}</p>
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-base flex-1">
                        &ldquo;{review.content}&rdquo;
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
