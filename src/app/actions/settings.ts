
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
        subheadline: "Upload a file and get instant answers to your questions with the power of AI.",
        cta_button: "Upload File",
        cta_secondary: "No credit card required"
    },
    features: {
        headline: "A Smarter Way to Work With Documents",
        subheadline: "Doc-Chat AI transforms your static documents into dynamic conversational partners.",
        items: [
            { icon: "UploadCloud", title: "Seamless File Upload", description: "Drag and drop any supported file to get started. Your documents are processed quickly and securely." },
            { icon: "Sparkles", title: "Intelligent AI-Powered Q&A", description: "Ask complex questions and receive accurate, context-aware answers in seconds." },
            { icon: "ShieldCheck", title: "Secure & Private by Design", description: "Your data is encrypted and confidential. Chat with your documents with complete peace of mind." }
        ]
    },
    faq: {
        headline: "Frequently Asked Questions",
        subheadline: "Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.",
        items: [
            { question: "How does Doc-Chat AI work?", answer: "Doc-Chat AI uses advanced large language models to analyze the content of your documents. Once you upload a file, our AI reads and understands the text, allowing you to ask questions and receive intelligent, context-aware answers in a conversational format." },
            { question: "Is my data secure?", answer: "Yes, security is our top priority. All documents are encrypted in transit and at rest. We do not use your data for training our models. You have full control over your documents and can delete them from our servers at any time." },
            { question: "What kind of documents can I upload?", answer: "We support a variety of formats like PDF, DOCX, TXT, and more. The maximum file size depends on your subscription plan." },
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
        upload_limit_mb_free: 5,
        upload_limit_mb_pro: 100,
        feature_banner_ads_enabled: false,
        banner_ad_code: null,
        feature_multiplex_ads_enabled: false,
        multiplex_ad_code: null,
        feature_in_feed_ads_enabled: false,
        in_feed_ad_code: null,
        feature_daily_reward_enabled: false,
        daily_reward_link: "https://google.com",
        daily_reward_clicks_required: 10,
        subscription_review_hours: 24,
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
    
    // Robustly merge landing page content with defaults to prevent client-side errors
    const loadedContent = (data.landing_page_content || {}) as any;
    const defaultContent = (defaultLandingPageContent || {}) as any;
    const loadedLegal = loadedContent.legal_pages || {};
    const defaultLegal = defaultContent.legal_pages || {};

    data.landing_page_content = {
      hero: { ...defaultContent.hero, ...(loadedContent.hero || {}) },
      features: { ...defaultContent.features, ...(loadedContent.features || {}) },
      faq: { ...defaultContent.faq, ...(loadedContent.faq || {}) },
      legal_pages: {
        privacy: { ...defaultLegal.privacy, ...(loadedLegal.privacy || {}) },
        terms: { ...defaultLegal.terms, ...(loadedLegal.terms || {}) },
        about: { ...defaultLegal.about, ...(loadedLegal.about || {}) },
        contact: { ...defaultLegal.contact, ...(loadedLegal.contact || {}) },
      },
    };

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
            upload_limit_mb_free: data.upload_limit_mb_free,
            upload_limit_mb_pro: data.upload_limit_mb_pro,
            feature_banner_ads_enabled: data.feature_banner_ads_enabled,
            banner_ad_code: data.banner_ad_code || null,
            feature_multiplex_ads_enabled: data.feature_multiplex_ads_enabled,
            multiplex_ad_code: data.multiplex_ad_code || null,
            feature_in_feed_ads_enabled: data.feature_in_feed_ads_enabled,
            in_feed_ad_code: data.in_feed_ad_code || null,
            feature_daily_reward_enabled: data.feature_daily_reward_enabled,
            daily_reward_link: data.daily_reward_link || null,
            daily_reward_clicks_required: data.daily_reward_clicks_required,
            subscription_review_hours: data.subscription_review_hours,
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
