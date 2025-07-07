
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function selectInitialPlan(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to select a plan.' };
    }

    const planName = formData.get('planName') as string;

    if (!planName) {
        return { error: 'Please select a plan.' };
    }

    const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: planName })
        .eq('id', user.id);

    if (error) {
        console.error("Error updating initial plan:", error.message);
        return { error: 'Could not update your plan. Please try again.' };
    }

    revalidatePath('/app', 'layout');
    redirect('/app');
}
