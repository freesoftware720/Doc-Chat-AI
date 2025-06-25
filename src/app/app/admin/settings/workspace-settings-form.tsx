
"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { updateWorkspaceSettings } from "@/app/actions/workspace";
import type { Tables } from "@/lib/supabase/database.types";

const formSchema = z.object({
  name: z.string().min(3, { message: "Workspace name must be at least 3 characters." }),
});

export function WorkspaceSettingsForm({ workspace }: { workspace: Tables<'workspaces'> }) {
  const [state, formAction] = useActionState(updateWorkspaceSettings, undefined);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workspace.name || "",
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
      <form action={formAction} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Company, Inc." {...field} disabled={form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>Allowed File Types</FormLabel>
            <FormControl>
                <Input value={workspace.allowed_file_types?.join(', ') || 'N/A'} disabled />
            </FormControl>
            <FormDescription>
                This setting is managed by your plan.
            </FormDescription>
        </FormItem>
        <FormItem>
            <FormLabel>Document Limit</FormLabel>
            <FormControl>
                <Input type="number" value={workspace.max_documents} disabled />
            </FormControl>
             <FormDescription>
                This setting is managed by your plan.
            </FormDescription>
        </FormItem>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader className="animate-spin" /> : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
