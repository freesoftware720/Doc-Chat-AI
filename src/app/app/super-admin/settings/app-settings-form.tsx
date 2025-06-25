
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --- Zod Schemas for Landing Page Content ---

const heroContentSchema = z.object({
    headline_static_1: z.string().min(1, "Headline is required."),
    headline_animated: z.array(z.object({ value: z.string().min(1, "Animated text cannot be empty.") })),
    subheadline: z.string().min(1, "Subheadline is required."),
    image_url: z.string().url("Must be a valid URL.").or(z.literal("")),
    image_hint: z.string(),
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

const pricingPlanSchema = z.object({
    name: z.string().min(1, "Plan name is required."),
    price: z.string().min(1, "Price is required."),
    period: z.string().min(1, "Period is required."),
    description: z.string().min(1, "Description is required."),
    features: z.string(), // Handled as a string and converted to array on the server
    cta: z.string().min(1, "CTA text is required."),
    link: z.string().min(1, "CTA link is required."),
    isPopular: z.boolean(),
});

const pricingContentSchema = z.object({
    headline: z.string().min(1, "Headline is required."),
    subheadline: z.string().min(1, "Subheadline is required."),
    plans: z.array(pricingPlanSchema),
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

const landingPageContentSchema = z.object({
    hero: heroContentSchema,
    features: featuresContentSchema,
    pricing: pricingContentSchema,
    faq: faqContentSchema,
});

const formSchema = z.object({
  chat_limit_free_user: z.coerce.number().min(0, "Limit must be a positive number."),
  feature_chat_templates_enabled: z.boolean().default(false),
  feature_multi_pdf_enabled: z.boolean().default(false),
  homepage_announcement_message: z.string().nullable(),
  logo_url: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).nullable(),
  landing_page_content: landingPageContentSchema,
});

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <Loader2 className="animate-spin mr-2" /> : null}
          Save All Settings
        </Button>
    )
}

export function AppSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction] = useActionState(updateAppSettings, null);
  const { toast } = useToast();
  
  const defaultLpContent = settings.landing_page_content || {};
  // Prepare default values, converting feature arrays to newline-separated strings
  const preparedLpContent = {
      ...defaultLpContent,
      hero: {
        ...defaultLpContent.hero,
        headline_animated: (defaultLpContent.hero?.headline_animated || []).map((v: string) => ({ value: v }))
      },
      pricing: {
          ...defaultLpContent.pricing,
          plans: (defaultLpContent.pricing?.plans || []).map((plan: any) => ({
              ...plan,
              features: (plan.features || []).join('\n'),
          }))
      }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chat_limit_free_user: settings.chat_limit_free_user,
      feature_chat_templates_enabled: settings.feature_chat_templates_enabled,
      feature_multi_pdf_enabled: settings.feature_multi_pdf_enabled,
      homepage_announcement_message: settings.homepage_announcement_message || "",
      logo_url: settings.logo_url || "",
      landing_page_content: preparedLpContent,
    },
  });

  const { fields: heroAnimatedFields, append: appendHeroAnimated, remove: removeHeroAnimated } = useFieldArray({ control: form.control, name: "landing_page_content.hero.headline_animated" });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: "landing_page_content.features.items" });
  const { fields: planFields, append: appendPlan, remove: removePlan } = useFieldArray({ control: form.control, name: "landing_page_content.pricing.plans" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "landing_page_content.faq.items" });

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
    }
    if (state?.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
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
                        <h3 className="text-lg font-medium">Usage Quotas</h3>
                        <FormField control={form.control} name="chat_limit_free_user" render={({ field }) => (<FormItem><FormLabel>Chat Limit for Free Users</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormDescription>Max number of messages a free user can send daily.</FormDescription><FormMessage /></FormItem>)}/>
                    </div>
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
                        <FormField control={form.control} name="landing_page_content.hero.headline_static_1" render={({ field }) => (<FormItem><FormLabel>Headline (Static Part)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <div><FormLabel>Headline (Animated Part)</FormLabel>
                        {heroAnimatedFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 mt-2">
                                <FormField control={form.control} name={`landing_page_content.hero.headline_animated.${index}.value`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeHeroAnimated(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendHeroAnimated({value: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Animated Text</Button></div>
                        <FormField control={form.control} name="landing_page_content.hero.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.hero.image_url" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.hero.image_hint" render={({ field }) => (<FormItem><FormLabel>Image AI Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>One or two keywords for AI image search.</FormDescription><FormMessage /></FormItem>)}/>
                    </CardContent></Card>
                    <Separator />
                    {/* Features Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">Features Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.features.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.features.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormLabel>Feature Items</FormLabel>
                        <div className="space-y-4">
                            {featureFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative"><FormField control={form.control} name={`landing_page_content.features.items.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Use any icon name from lucide-react.</FormDescription><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.features.items.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.features.items.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFeature(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendFeature({icon: 'Sparkles', title: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add Feature</Button>
                    </CardContent></Card>
                    <Separator />
                    {/* Pricing Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">Pricing Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.pricing.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.pricing.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormLabel>Pricing Plans</FormLabel>
                        <div className="space-y-4">
                            {planFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative"><div className="grid grid-cols-3 gap-4"><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.price`} render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.period`} render={({ field }) => (<FormItem><FormLabel>Period</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/></div><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.features`} render={({ field }) => (<FormItem><FormLabel>Features</FormLabel><FormControl><Textarea {...field} /></FormControl><FormDescription>Enter one feature per line.</FormDescription><FormMessage /></FormItem>)}/><div className="grid grid-cols-2 gap-4"><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.cta`} render={({ field }) => (<FormItem><FormLabel>CTA Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.link`} render={({ field }) => (<FormItem><FormLabel>CTA Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/></div><FormField control={form.control} name={`landing_page_content.pricing.plans.${index}.isPopular`} render={({ field }) => (<FormItem className="flex flex-row items-center gap-2 pt-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl><FormLabel>Is Popular?</FormLabel></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removePlan(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendPlan({name: '', price: '', period: '', description: '', features: '', cta: '', link: '', isPopular: false})}><PlusCircle className="mr-2 h-4 w-4"/>Add Plan</Button>
                    </CardContent></Card>
                    <Separator />
                    {/* FAQ Section */}
                    <Card><CardHeader><h3 className="text-lg font-medium">FAQ Section</h3></CardHeader><CardContent className="space-y-4">
                        <FormField control={form.control} name="landing_page_content.faq.headline" render={({ field }) => (<FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="landing_page_content.faq.subheadline" render={({ field }) => (<FormItem><FormLabel>Subheadline</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormLabel>FAQ Items</FormLabel>
                        <div className="space-y-4">
                            {faqFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative"><FormField control={form.control} name={`landing_page_content.faq.items.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/><FormField control={form.control} name={`landing_page_content.faq.items.${index}.answer`} render={({ field }) => (<FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeFaq(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendFaq({question: '', answer: ''})}><PlusCircle className="mr-2 h-4 w-4"/>Add FAQ</Button>
                    </CardContent></Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <SubmitButton />
      </form>
    </Form>
  );
}
