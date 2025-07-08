
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
                
                {/* Top Border */}
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[1.5px] w-[105%] origin-center scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:shadow-[0_0_8px_hsl(var(--primary))]"></span>
                
                {/* Bottom Border */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-[105%] origin-center scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:shadow-[0_0_8px_hsl(var(--primary))]"></span>
                
                {/* Left Border */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[1.5px] h-[105%] origin-center scale-y-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-y-100 group-hover:shadow-[0_0_8px_hsl(var(--primary))]"></span>

                {/* Right Border */}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[1.5px] h-[105%] origin-center scale-y-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-y-100 group-hover:shadow-[0_0_8px_hsl(var(--primary))]"></span>

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
