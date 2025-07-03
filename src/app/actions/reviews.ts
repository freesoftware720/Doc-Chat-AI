'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Tables } from '@/lib/supabase/database.types';

export type ReviewWithProfile = Tables<'reviews'> & {
    profiles: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null;
};

export async function getTopReviews(): Promise<ReviewWithProfile[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching top reviews:", error.message);
        return [];
    }

    return data as ReviewWithProfile[];
}

export async function getUserReview() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching user review:", error.message);
        return null;
    }

    return data;
}

export async function submitReview(prevState: any, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to submit a review.' };
    }

    const rating = parseInt(formData.get('rating') as string, 10);
    const content = formData.get('content') as string;

    if (!rating || rating < 1 || rating > 5) {
        return { error: 'Invalid rating. Please select between 1 and 5 stars.' };
    }
    if (!content.trim()) {
        return { error: 'Please write a review before submitting.' };
    }

    const { error } = await supabase
        .from('reviews')
        .upsert({
            user_id: user.id,
            rating: rating,
            content: content,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Error submitting review:", error.message);
        return { error: 'There was a problem submitting your review. Please try again.' };
    }

    revalidatePath('/app/review');
    revalidatePath('/'); // Revalidate landing page to show new review if it's in top 10
    return { success: 'Thank you for your review!' };
}
