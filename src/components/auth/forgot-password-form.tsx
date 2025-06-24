"use client"

import { useActionState, useEffect } from "react";
import { sendPasswordResetEmail } from "@/app/actions/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthCardContent } from "./auth-card";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
})

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(sendPasswordResetEmail, undefined);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
    values: state?.fields,
  })

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Success", description: state.success });
    }
    if (state?.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast])

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="space-y-6"
      >
        <AuthCardContent>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? <Loader className="animate-spin" /> : "Send Reset Link"}
          </Button>
        </AuthCardContent>
      </form>
    </Form>
  )
}
