
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
    
    // Invalidate the cache for the layout to ensure profile updates are reflected
    revalidatePath('/app', 'layout');

    // After plan selection, redirect to the correct starting point
    if (planName === 'Student') {
        const { data: documents } = await supabase
            .from('documents')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (documents && documents.length > 0) {
            // If they have documents, go to the hub for the most recent one
            redirect(`/app/student/${documents[0].id}`);
        } else {
            // If no documents, go to the uploads page
            redirect('/app/uploads');
        }
    } else {
        // For all other plans, go to the main dashboard
        redirect('/app');
    }
}
