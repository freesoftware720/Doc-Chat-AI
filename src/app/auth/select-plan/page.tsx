
import { getActivePlans } from "@/app/actions/billing";
import { PlanSelectionCard } from './plan-selection-card';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SelectPlanPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/auth/login');
    }

    const plans = await getActivePlans();
    // Only show individual plans on the initial selection screen
    const individualPlans = plans.filter(p => p.type === 'individual');

    return (
        <div className="w-full max-w-5xl p-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Welcome! Choose Your Plan</h1>
                <p className="mt-4 text-lg text-muted-foreground">Select a plan to get started with Doc-Chat AI.</p>
            </div>
            {individualPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {individualPlans.map(plan => (
                        <PlanSelectionCard key={plan.id} plan={plan} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 border rounded-lg">
                    No plans are currently available. Please contact support.
                </div>
            )}
        </div>
    )
}
