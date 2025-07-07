
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Gift } from 'lucide-react';
import type { Tables } from '@/lib/supabase/database.types';

type Profile = Tables<'profiles'>;

export function ReferralCard({ profile }: { profile: Profile | null }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    
    if (!profile) return null;

    const referralLink = `https://chat-doc-ai.vercel.app/auth/register?ref=${profile.referral_code}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setCopied(true);
            toast({ title: "Copied!", description: "Referral link copied to clipboard." });
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    Refer & Earn
                </CardTitle>
                <CardDescription>
                    Invite friends to Doc-Chat AI and earn free Pro credits for each successful sign-up.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-muted-foreground">Your unique referral link</label>
                    <div className="flex items-center gap-2 mt-1">
                        <Input value={referralLink} readOnly className="bg-muted/50" />
                        <Button variant="outline" size="icon" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Pro Credits Earned</span>
                    <span className="text-2xl font-bold text-primary">{profile.pro_credits || 0}</span>
                </div>
            </CardContent>
        </Card>
    );
}
