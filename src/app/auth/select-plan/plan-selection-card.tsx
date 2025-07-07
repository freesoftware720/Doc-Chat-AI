
"use client";

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Loader2 } from 'lucide-react';
import type { Plan } from "@/app/actions/billing";
import { selectInitialPlan } from '@/app/actions/onboarding';
import { useToast } from '@/hooks/use-toast';

function SubmitButton({ planName }: { planName: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : `Choose ${planName}`}
        </Button>
    )
}

export function PlanSelectionCard({ plan }: { plan: Plan }) {
    const [state, formAction] = useActionState(selectInitialPlan, null);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.error) {
            toast({ variant: 'destructive', title: 'Error', description: state.error });
        }
    }, [state, toast]);

    return (
         <Card className={`rounded-2xl shadow-lg bg-gradient-to-br from-card/60 to-card/20 flex flex-col transition-all duration-300 h-full ${plan.is_popular ? "border-primary/50 shadow-primary/20" : "border-white/10 shadow-primary/10"}`}>
            <form action={formAction}>
                <input type="hidden" name="planName" value={plan.name} />
                <CardHeader className="p-8">
                    {plan.is_popular && <div className="text-xs font-bold uppercase text-primary tracking-widest mb-2">Most Popular</div>}
                    <CardTitle className="text-2xl font-headline tracking-tight">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold font-headline">{plan.currency_symbol}{plan.price}</span>
                        <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription className="pt-4 text-base min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1">
                    <ul className="space-y-4">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0 mt-auto">
                    <SubmitButton planName={plan.name} />
                </CardFooter>
            </form>
        </Card>
    )
}
