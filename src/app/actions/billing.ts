
'use server';

import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

export type Plan = Tables<'plans'>;

export async function getActivePlans(): Promise<Plan[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

    if (error) {
        console.error("Error fetching plans:", error.message);
        return [];
    }

    return data || [];
}

export async function getActivePaymentGateways() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .order('name');
    
    if (error) {
        console.error("Error fetching payment gateways:", error.message);
        return [];
    }
    
    return data || [];
}

    