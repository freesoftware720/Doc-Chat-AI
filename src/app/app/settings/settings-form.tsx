
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import type { Tables } from "@/lib/supabase/database.types";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
});

type Profile = Tables<'profiles'>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : "Save Changes"}
    </Button>
  )
}

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      email: profile?.id ? "" : "", // Email from auth, not profile table
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || "",
        email: profile.id ? "" : "",
      });
    }
  }, [profile, form]);
  
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
      <form action={formAction} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
                <Input type="email" value={profile?.id ? "Loading..." : "Not available"} disabled />
            </FormControl>
            <p className="text-xs text-muted-foreground">You cannot change your email address.</p>
        </FormItem>

        <SubmitButton />
      </form>
    </Form>
  );
}
