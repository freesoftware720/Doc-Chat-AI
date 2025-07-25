
"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { updateAppSettings, type AppSettings } from "@/app/actions/settings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Zod Schemas for Landing Page Content ---

const heroContentSchema = z.object({
    headline_part_1: z.string().min(1, "Part 1 is required."),
    headline_animated_texts: z.array(z.object({ value: z.string().min(1, "Text cannot be empty.") })),
    headline_part_2: z.string().min(1, "Part 2 is required."),
    subheadline: z.string().min(1, "Subheadline is required."),
    cta_button: z.string().min(1, "Button text is required"),
    cta_secondary: z.string(),
});

const featureItemSchema = z.object({
    icon: z.string().min(1, "Icon name is required."),
    title: z.string().min(1, "Title is required."),
    description: z.string().min(1, "Description is required."),
});

const featuresContentSchema = z.object({
    headline: z.string().min(1, "Headline is required."),
    subheadline: z.string().min(1, "Subheadline is required."),
    items: z.array(featureItemSchema),
});

const faqItemSchema = z.object({
    question: z.string().min(1, "Question is required."),
    answer: z.string().min(1, "Answer is required."),
});

const faqContentSchema = z.object({
    headline: z.string().min(1, "Headline is required."),
    subheadline: z.string().min(1, "Subheadline is required."),
    items: z.array(faqItemSchema),
});

const legalPageSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
});

const landingPageContentSchema = z.object({
    hero: heroContentSchema,
    features: featuresContentSchema,
    faq: faqContentSchema,
    legal_pages: z.object({
        privacy: legalPageSchema,
        terms: legalPageSchema,
        about: legalPageSchema,
        contact: legalPageSchema,
    }),
});

const formSchema = z.object({
  chat_limit_free_user: z.coerce.number().min(0, "Limit must be a positive number."),
  upload_limit_mb_free: z.coerce.number().min(1, "Limit must be at least 1MB."),
  upload_limit_mb_pro: z.coerce.number().min(1, "Limit must be at least 1MB."),
  feature_chat_templates_enabled: z.boolean().default(false),
  feature_multi_pdf_enabled: z.boolean().default(false),
  homepage_announcement_message: z.string().nullable(),
  logo_url: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).nullable(),
  landing_page_content: landingPageContentSchema,
  feature_video_ads_enabled: z.boolean().default(false),
  video_ad_code: z.string().nullable(),
  video_ad_skip_timer: z.coerce.number().min(0, "Timer must be a positive number."),
  feature_banner_ads_enabled: z.boolean().default(false),
  banner_ad_code: z.string().nullable(),
  feature_multiplex_ads_enabled: z.boolean().default(false),
  multiplex_ad_code: z.string().nullable(),
  feature_in_feed_ads_enabled: z.boolean().default(false),
  in_feed_ad_code: z.string().nullable(),
  feature_daily_reward_enabled: z.boolean().default(false),
  daily_reward_link: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).nullable(),
  daily_reward_clicks_required: z.coerce.number().min(1, "Clicks must be at least 1."),
  subscription_review_hours: z.coerce.number().min(1, "Review time must be at least 1 hour."),
});


export function AppSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction] = useActionState(updateAppSettings, null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const defaultLpContent = settings.landing_page_content as any || {};

  // Prepare default values for the form, ensuring all nested objects exist.
  const preparedLpContent = {
      ...defaultLpContent,
      hero: {
          ...defaultLpContent.hero,
          headline_animated_texts: (defaultLpContent.hero?.headline_animated_texts || []).map((text: string) => ({ value: text }))
      },
      legal_pages: defaultLpContent.legal_pages || {
        privacy: { title: "", content: "" },
        terms: { title: "", content: "" },
        about: { title: "", content: "" },
        contact: { title: "", content: "" },
      },
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...settings,
      chat_limit_free_user: settings.chat_limit_free_user || 50,
      upload_limit_mb_free: settings.upload_limit_mb_free || 5,
      upload_limit_mb_pro: settings.upload_limit_mb_pro || 100,
      video_ad_skip_timer: settings.video_ad_skip_timer || 5,
      daily_reward_clicks_required: settings.daily_reward_clicks_required || 10,
      subscription_review_hours: settings.subscription_review_hours || 24,
      homepage_announcement_message: settings.homepage_announcement_message || "",
      logo_url: settings.logo_url || "",
      landing_page_content: preparedLpContent,
      video_ad_code: settings.video_ad_code || "",
      banner_ad_code: settings.banner_ad_code || "",
      multiplex_ad_code: settings.multiplex_ad_code || "",
      in_feed_ad_code: settings.in_feed_ad_code || "",
      daily_reward_link: settings.daily_reward_link || "",
    },
  });
  
  const { fields: animatedTextFields, append: appendAnimatedText, remove: removeAnimatedText } = useFieldArray({ control: form.control, name: "landing_page_content.hero.headline_animated_texts" });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: "landing_page_content.features.items" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "landing_page_content.faq.items" });

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
    }
    if (state?.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(() => {
        formAction(data);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Accordion type="multiple" defaultValue={['general']} className="w-full">
            {/* General Settings */}
            <AccordionItem value="general">
                <AccordionTrigger className="text-xl font-headline">General Settings</AccordionTrigger>
                <AccordionContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Feature Flags</h3>
                        <FormField control={form.control} name="feature_chat_templates_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Chat Templates</FormLabel><FormDescription>Allow users to use pre-defined prompt templates.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                        <FormField control={form.control} name="feature_multi_pdf_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Multi-PDF Chat</FormLabel><FormDescription>Allow users to chat with multiple documents at once.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)}/>
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">Usage Quotas & Subscriptions</h3>
                        <FormField control={form.control} name="chat_limit_free_user" render={({ field }) => (<FormItem><FormLabel>Chat Limit for Free Users</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Max number of messages a free user can send daily.</FormDescription><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="upload_limit_mb_free" render={({ field }) => (<FormItem><FormLabel>Upload Limit for Free Users (MB)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Max file size for free users.</FormDescription><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="upload_limit_mb_pro" render={({ field }) => (<FormItem><FormLabel>Upload Limit for Pro Users (MB)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Max file size for Pro users.</FormDescription><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="subscription_review_hours" render={({ field }) => (<FormItem><FormLabel>Subscription Review Time (hours)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Time limit for manual subscription review.</FormDescription><FormMessage /></FormItem>)}/>
                    </div>
                </AccordionContent>
            </AccordionItem>
             {/* Daily Rewards */}
            <AccordionItem value="daily-rewards">
                <AccordionTrigger className="text-xl font-headline">Daily Rewards & Gamification</AccordionTrigger>
                 <AccordionContent className="pt-6 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Reward Settings</CardTitle>
                             <FormDescription>Configure a daily reward for free users to reset their chat limit.</FormDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField control={form.control} name="feature_daily_reward_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Daily Rewards for Free Users</FormLabel><FormDescription>Allow users to earn a daily message limit reset.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="daily_reward_link" render={({ field }) => (<FormItem><FormLabel>Reward URL</FormLabel><FormControl><Input placeholder="https://example.com" {...field} value={field.value ?? ''} /></FormControl><FormDescription>The link users must click to earn the reward.</FormDescription><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="daily_reward_clicks_required" render={({ field }) => (<FormItem><FormLabel>Required Clicks</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>How many times a user must click the link.</FormDescription><FormMessage /></FormItem>)}/>
                            </div>
                        </CardContent>
                    </Card>
                 </AccordionContent>
            </AccordionItem>
            {/* Monetization */}
            <AccordionItem value="monetization">
                <AccordionTrigger className="text-xl font-headline">Monetization & Ads</AccordionTrigger>
                 <AccordionContent className="pt-6 space-y-8">
                    {/* Video Ads */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Ad Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <FormField control={form.control} name="feature_video_ads_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Video Ads for Free Users</FormLabel><FormDescription>Show an ad when free users upload or start a chat.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="video_ad_skip_timer" render={({ field }) => (<FormItem><FormLabel>Ad Skip Timer (seconds)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>How long users must wait before skipping the ad.</FormDescription><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="video_ad_code" render={({ field }) => (<FormItem><FormLabel>Video Ad Code</FormLabel><FormControl><Textarea placeholder="Paste your ad network code here..." {...field} value={field.value ?? ''} rows={6} /></FormControl><FormDescription>Paste your ad network script here (e.g., from AdSense or Adsterra).</FormDescription><FormMessage /></FormItem>)}/>
                            </div>
                        </CardContent>
                    </Card>
                     {/* Display Ads */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Ad Settings</CardTitle>
                             <FormDescription>Manage banner, in-feed, and other display ad units.</FormDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Banner Ads */}
                            <FormField control={form.control} name="feature_banner_ads_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Banner Ads</FormLabel><FormDescription>Show a banner ad on dashboard pages.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                            <FormField control={form.control} name="banner_ad_code" render={({ field }) => (<FormItem><FormLabel>Banner Ad Code</FormLabel><FormControl><Textarea placeholder="Paste your banner ad code here..." {...field} value={field.value ?? ''} rows={4} /></FormControl><FormMessage /></FormItem>)}/>
                            <Separator />
                            {/* In-Feed Ads */}
                            <FormField control={form.control} name="feature_in_feed_ads_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable In-Feed Ads</FormLabel><FormDescription>Show ads within content lists (e.g., document list).</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                            <FormField control={form.control} name="in_feed_ad_code" render={({ field }) => (<FormItem><FormLabel>In-Feed Ad Code</FormLabel><FormControl><Textarea placeholder="Paste your in-feed ad code here..." {...field} value={field.value ?? ''} rows={4} /></FormControl><FormMessage /></FormItem>)}/>
                            <Separator />
                            {/* Multiplex Ads */}
                            <FormField control={form.control} name="feature_multiplex_ads_enabled" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Enable Multiplex Ads</FormLabel><FormDescription>Show a grid-style ad unit on the dashboard.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl></FormItem>)}/>
                            <FormField control={form.control} name="multiplex_ad_code" render={({ field }) => (<FormItem><FormLabel>Multiplex Ad Code</FormLabel><FormControl><Textarea placeholder="Paste your multiplex ad code here..." {...field} value={field.value ?? ''} rows={4} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>
                 </AccordionContent>
            </AccordionItem>
            {/* Branding */}
            <AccordionItem value="branding">
                <AccordionTrigger className="text-xl font-headline">Branding & Announcements</AccordionTrigger>
                 <AccordionContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="logo_url" render={({ field }) => (<FormItem><FormLabel>Logo URL</FormLabel><FormControl><Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Enter the URL for the site logo. Leave blank for default.</FormDescription><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="homepage_announcement_message" render={({ field }) => (<FormItem><FormLabel>Homepage Announcement</FormLabel><FormControl><Textarea placeholder="E.g., We're running a promotion!" {...field} value={field.value ?? ''} /></FormControl><FormDescription>A message to display at the top of the homepage.</FormDescription><FormMessage /></FormItem>)}/>
                 </AccordionContent>
            </AccordionItem>
            {/* Landing Page Content */}
            <AccordionItem value="landing-page">
                <AccordionTrigger className="text-xl font-headline">Landing Page Content</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-6">
                    {/* Hero Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">Hero Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.hero.headline_part_1" render={({ field }) => (<FormItem><FormLabel>Headline (Part 1)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormDescription>The text before the animated part.</FormDescription><FormMessage /></FormItem>)}/>
                        
                        <div>
                            <FormLabel>Headline (Animated Words)</FormLabel>
                            <FormDescription>These words will cycle in the headline.</FormDescription>
                            <div className="space-y-2 mt-2">
                                {animatedTextFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2"><FormField control={form.control} name={`landing_page_content.hero.headline_animated_texts.${index}.value`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/><Button type="button" variant="ghost" size="icon" onClick={() => removeAnimatedText(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendAnimatedText({value: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Word</Button>
                        </div>
                        
                        <FormField control={form.control} name="landing_page_content.hero.headline_part_2" render={({ field }) => (<FormItem><FormLabel>Headline (Part 2)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormDescription>The text after the animated part.</FormDescription><FormMessage /></FormItem>)}/>
                        
                        <Separator />
                        
                        <FormField control={form.control} name="landing_page_content.hero.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.hero.cta_button" render={({ field }) => (<FormItem><FormLabel>Button Text</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.hero.cta_secondary" render={({ field }) => (<FormItem><FormLabel>Secondary CTA Text</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormDescription>e.g., "No credit card required"</FormDescription><FormMessage /></FormItem>)}/>
                    </CardContent></Card>

                    <Separator />
                    {/* Features Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">Features Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.features.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.features.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormLabel>Feature Items</FormLabel>
                        <div className="space-y-4">
                            {featureFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative"><FormField control={form.control} name={`landing_page_content.features.items.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormDescription>Use any icon name from lucide-react.</FormDescription><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.features.items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.features.items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFeature(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendFeature({icon: 'Sparkles', title: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Feature</Button>
                    </CardContent></Card>
                    <Separator />
                    {/* FAQ Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">FAQ Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.faq.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.faq.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormLabel>FAQ Items</FormLabel>
                        <div className="space-y-4">
                            {faqFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative"><FormField control={form.control} name={`landing_page_content.faq.items.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.faq.items.${index}.answer`} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFaq(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendFaq({question: '', answer: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add FAQ</Button>
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
            {/* Legal Pages */}
            <AccordionItem value="legal-pages">
                <AccordionTrigger className="text-xl font-headline">Legal & Info Pages</AccordionTrigger>
                <AccordionContent className="space-y-6 pt-6">
                    <Card>
                        <CardHeader><h3 className="text-lg font-medium">Privacy Policy</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="landing_page_content.legal_pages.privacy.title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="landing_page_content.legal_pages.privacy.content" render={({ field }) => (<FormItem><FormLabel>Page Content (Markdown)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={10} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><h3 className="text-lg font-medium">Terms of Service</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="landing_page_content.legal_pages.terms.title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="landing_page_content.legal_pages.terms.content" render={({ field }) => (<FormItem><FormLabel>Page Content (Markdown)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={10} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><h3 className="text-lg font-medium">About Us</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="landing_page_content.legal_pages.about.title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="landing_page_content.legal_pages.about.content" render={({ field }) => (<FormItem><FormLabel>Page Content (Markdown)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={10} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><h3 className="text-lg font-medium">Contact Us</h3></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={form.control} name="landing_page_content.legal_pages.contact.title" render={({ field }) => (<FormItem><FormLabel>Page Title</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="landing_page_content.legal_pages.contact.content" render={({ field }) => (<FormItem><FormLabel>Page Content (Markdown)</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={10} /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          Save All Settings
        </Button>
      </form>
    </Form>
  );
}
