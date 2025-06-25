
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
    pricing: {
        headline: "Choose the Plan That's Right for You",
        subheadline: "Simple, transparent pricing. No hidden fees.",
        plans: [
            { name: "Free", price: "$0", period: "/ month", description: "For individuals and small projects to get a taste of AI power.", features: ["3 PDF uploads / month", "50 questions / month", "2MB file size limit", "Community support"], cta: "Start for Free", link: "/app", isPopular: false },
            { name: "Pro", price: "$19", period: "/ month", description: "For professionals and teams who need unlimited power.", features: ["Unlimited PDF uploads", "Unlimited questions", "32MB file size limit", "Priority email support", "Advanced AI models"], cta: "Go Pro", link: "/app", isPopular: true }
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
    }
};


export async function getAppSettings(): Promise<AppSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error || !data) {
        console.error('Error fetching app settings, returning defaults:', error);
        // Return default settings on error or if row doesn't exist
        return {
            id: 1,
            chat_limit_free_user: 50,
            feature_chat_templates_enabled: true,
            feature_multi_pdf_enabled: false,
            homepage_announcement_message: null,
            logo_url: null,
            landing_page_content: defaultLandingPageContent,
            updated_at: new Date().toISOString(),
        };
    }
    // Ensure landing_page_content is not null
    if (!data.landing_page_content) {
        data.landing_page_content = defaultLandingPageContent;
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

        // The form sends the pricing features as a single string, so we convert it back to an array.
        if (landingPageContent?.pricing?.plans) {
            landingPageContent.pricing.plans.forEach((plan: any) => {
                if (plan.features && typeof plan.features === 'string') {
                    plan.features = (plan.features as string).split('\n').filter(f => f.trim() !== '');
                }
            });
        }
        
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
        return { success: 'Application settings updated successfully.' };

    } catch (e: any) {
        console.error("Failed to update app settings:", e);
        return { error: `Failed to update settings: ${e.message}` };
    }
}
