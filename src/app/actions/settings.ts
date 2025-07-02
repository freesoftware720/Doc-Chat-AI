
'use server';

import { revalidatePath } from 'next/cache';
import { serviceSupabase } from '@/lib/supabase/service';
import { isSuperAdmin } from './super-admin';
import { createClient } from '@/lib/supabase/server';
import type { Json, Tables, TablesUpdate } from '@/lib/supabase/database.types';

export type AppSettings = Tables<'app_settings'>;

const defaultLandingPageContent: Json = {
    hero: {
        headline_part_1: "Chat with your",
        headline_animated_texts: ["documents", "reports", "manuals", "textbooks"],
        headline_part_2: "using AI",
        subheadline: "Upload a PDF and get instant answers to your questions with the power of AI.",
        cta_button: "Upload PDF",
        cta_secondary: "No credit card required"
    },
    features: {
        headline: "A Smarter Way to Work With Documents",
        subheadline: "Doc-Chat AI transforms your static documents into dynamic conversational partners.",
        items: [
            { icon: "UploadCloud", title: "Seamless PDF Upload", description: "Drag and drop any PDF to get started. Your documents are processed quickly and securely." },
            { icon: "Sparkles", title: "Intelligent AI-Powered Q&A", description: "Ask complex questions and receive accurate, context-aware answers in seconds." },
            { icon: "ShieldCheck", title: "Secure & Private by Design", description: "Your data is encrypted and confidential. Chat with your documents with complete peace of mind." }
        ]
    },
    faq: {
        headline: "Frequently Asked Questions",
        subheadline: "Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.",
        items: [
            { question: "How does Doc-Chat AI work?", answer: "Doc-Chat AI uses advanced large language models to analyze the content of your PDF documents. Once you upload a file, our AI reads and understands the text, allowing you to ask questions and receive intelligent, context-aware answers in a conversational format." },
            { question: "Is my data secure?", answer: "Yes, security is our top priority. All documents are encrypted in transit and at rest. We do not use your data for training our models. You have full control over your documents and can delete them from our servers at any time." },
            { question: "What kind of documents can I upload?", answer: "Currently, we support PDF documents. We are working on expanding our capabilities to include other formats like DOCX, TXT, and more in the near future. The maximum file size depends on your subscription plan." },
            { question: "Can I cancel my subscription anytime?", answer: "Absolutely. You can manage your subscription from your account settings. If you cancel, you will retain access to your plan's features until the end of the current billing cycle. There are no cancellation fees." }
        ]
    },
    legal_pages: {
        privacy: {
            title: "Privacy Policy",
            content: "This is the default privacy policy. Please update this content from the Super Admin settings."
        },
        terms: {
            title: "Terms of Service",
            content: "These are the default terms of service. Please update this content from the Super Admin settings."
        },
        about: {
            title: "About Us",
            content: "This is the default about us page. Please update this content from the Super Admin settings."
        },
        contact: {
            title: "Contact Us",
            content: "This is the default contact page. Please update this content from the Super Admin settings."
        }
    }
};


export async function getAppSettings(): Promise<AppSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

    const defaultSettings: AppSettings = {
        id: 1,
        chat_limit_free_user: 50,
        feature_chat_templates_enabled: true,
        feature_multi_pdf_enabled: false,
        homepage_announcement_message: null,
        logo_url: null,
        landing_page_content: defaultLandingPageContent,
        updated_at: new Date().toISOString(),
        feature_video_ads_enabled: false,
        video_ad_code: null,
        video_ad_skip_timer: 5,
    };

    // If no settings row is found (e.g., on first run), create it.
    if (error && error.code === 'PGRST116') {
        console.log('No app settings found, creating default settings...');
        if (!serviceSupabase) {
            console.error('Service client not available. Cannot create default settings. Returning hardcoded defaults.');
            return defaultSettings;
        }

        const { data: newData, error: insertError } = await serviceSupabase
            .from('app_settings')
            .insert(defaultSettings)
            .select()
            .single();

        if (insertError) {
            // A "unique constraint" violation (code 23505) is expected if another request
            // created the settings right before this one (a race condition). This is not a
            // critical error. We can safely proceed, and subsequent calls will fetch the
            // settings correctly. We log other errors as they are unexpected.
            if (insertError.code !== '23505') {
                 console.error('An unexpected error occurred while creating default app settings:', insertError.message || insertError);
            }
            return defaultSettings;
        }

        console.log('Default settings created successfully.');
        return newData;
    }

    if (error || !data) {
        console.error('Error fetching app settings, returning defaults:', error);
        return defaultSettings;
    }
    
    // Ensure landing_page_content is not null and contains all sections
    if (!data.landing_page_content) {
        data.landing_page_content = defaultLandingPageContent;
    } else {
        const content = data.landing_page_content as any;
        if (!content.legal_pages) {
            content.legal_pages = defaultLandingPageContent.legal_pages;
        }
    }


    return data;
}

export async function updateAppSettings(prevState: any, data: any) {
    if (!serviceSupabase) {
        return { error: "Service client not initialized." };
    }
    if (!(await isSuperAdmin())) {
        return { error: "Permission denied. You must be a Super Admin." };
    }

    try {
        const landingPageContent = data.landing_page_content;
        
        // Handle animated hero text array
        if (landingPageContent?.hero?.headline_animated_texts) {
            landingPageContent.hero.headline_animated_texts = landingPageContent.hero.headline_animated_texts.map((item: { value: string }) => item.value).filter((v: string) => v.trim() !== '');
        }

        const dataToUpdate: TablesUpdate<'app_settings'> = {
            chat_limit_free_user: data.chat_limit_free_user,
            feature_chat_templates_enabled: data.feature_chat_templates_enabled,
            feature_multi_pdf_enabled: data.feature_multi_pdf_enabled,
            homepage_announcement_message: data.homepage_announcement_message || null,
            logo_url: data.logo_url || null,
            landing_page_content: landingPageContent,
            feature_video_ads_enabled: data.feature_video_ads_enabled,
            video_ad_code: data.video_ad_code || null,
            video_ad_skip_timer: data.video_ad_skip_timer,
            updated_at: new Date().toISOString(),
        };

        const { error } = await serviceSupabase
            .from('app_settings')
            .update(dataToUpdate)
            .eq('id', 1);
        
        if (error) {
            throw new Error(error.message);
        }

        revalidatePath('/app/super-admin/settings');
        revalidatePath('/'); // For announcement, logo and all landing page changes to reflect
        revalidatePath('/pages', 'layout'); // Revalidate all legal pages
        return { success: 'Application settings updated successfully.' };

    } catch (e: any) {
        console.error("Failed to update app settings:", e);
        return { error: `Failed to update settings: ${e.message}` };
    }
}
