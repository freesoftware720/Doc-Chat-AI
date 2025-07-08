'use client';

import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { ReviewWithProfile } from '@/app/actions/reviews';

export function ReviewCard({ review }: { review: ReviewWithProfile }) {
    const name = review.profiles?.full_name || 'Anonymous';
    const avatarUrl = review.profiles?.avatar_url;
    const fallback = name.charAt(0).toUpperCase();

    return (
        <div className="gsap-review-card p-2 h-full">
            <Card className="relative h-full rounded-3xl shadow-2xl shadow-primary/10 bg-gradient-to-br from-card/60 to-card/20 border-white/10 overflow-hidden">
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
