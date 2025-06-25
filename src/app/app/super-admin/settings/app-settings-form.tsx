
"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateAppSettings, type AppSettings } from "@/app/actions/settings";

const formSchema = z.object({
  chat_limit_free_user: z.coerce.number().min(0, { message: "Limit must be a positive number." }),
  feature_chat_templates_enabled: z.boolean().default(false),
  feature_multi_pdf_enabled: z.boolean().default(false),
  homepage_announcement_message: z.string().nullable(),
  logo_url: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")).nullable(),
});

export function AppSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction] = useActionState(updateAppSettings, null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chat_limit_free_user: settings.chat_limit_free_user,
      feature_chat_templates_enabled: settings.feature_chat_templates_enabled,
      feature_multi_pdf_enabled: settings.feature_multi_pdf_enabled,
      homepage_announcement_message: settings.homepage_announcement_message || "",
      logo_url: settings.logo_url || "",
    },
  });
  
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature Flags */}
            <div className="space-y-6">
                <h3 className="text-lg font-medium font-headline">Feature Flags</h3>
                <FormField
                    control={form.control}
                    name="feature_chat_templates_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Chat Templates</FormLabel>
                                <FormDescription>Allow users to use pre-defined prompt templates.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} name={field.name} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="feature_multi_pdf_enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable Multi-PDF Chat</FormLabel>
                                <FormDescription>Allow users to chat with multiple documents at once.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} name={field.name} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            {/* Quotas */}
            <div className="space-y-6">
                 <h3 className="text-lg font-medium font-headline">Usage Quotas</h3>
                 <FormField
                    control={form.control}
                    name="chat_limit_free_user"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chat Limit for Free Users</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormDescription>The maximum number of messages a free user can send per month.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        {/* Branding & Announcements */}
        <div className="space-y-6">
            <h3 className="text-lg font-medium font-headline">Branding & Announcements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl><Input placeholder="https://example.com/logo.png" {...field} value={field.value ?? ''} /></FormControl>
                            <FormDescription>Enter the URL for the site logo. Leave blank to use the default.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="homepage_announcement_message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Homepage Announcement</FormLabel>
                            <FormControl><Textarea placeholder="E.g., We're running a promotion! Get 20% off Pro plans." {...field} value={field.value ?? ''} /></FormControl>
                            <FormDescription>A message to display at the top of the homepage. Leave blank to hide.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}

    