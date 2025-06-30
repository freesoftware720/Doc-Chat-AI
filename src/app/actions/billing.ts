'use server';

import { createClient } from '@/lib/supabase/server';

export async function getActivePaymentGateways() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .order('name');
    
    if (error) {
        console.error("Error fetching payment gateways:", error);
        return [];
    }
    
    return data;
}
