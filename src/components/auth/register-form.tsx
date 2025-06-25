
"use client"

import { useActionState, useEffect, useState, Suspense } from "react";
import { useFormStatus } from "react-dom";
import { register } from "@/app/actions/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthCardContent } from "./auth-card";
import { OAuthButtons } from "./oauth-buttons";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  terms: z.boolean().default(false).refine(val => val === true, { message: "You must accept the terms and conditions." }),
  referralCode: z.string().optional(),
})

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
     <Button type="submit" className="w-full" disabled={pending}>
       {pending ? <Loader2 className="animate-spin" /> : "Create Account"}
    </Button>
  )
}

function RegisterFormComponent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const [state, formAction] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", password: "", terms: false, referralCode: refCode || "" },
  })
  
  useEffect(() => {
    if (refCode) {
      form.setValue('referralCode', refCode);
    }
  }, [refCode, form]);

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Account Created", description: state.success });
      form.reset();
    }
    if (state?.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state, toast, form])

  return (
    <Form {...form}>
      <AuthCardContent className="space-y-4">
        <form
          action={formAction}
          className="space-y-4"
        >
             <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                      />
                       <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      I accept the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                    </FormLabel>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <input type="hidden" {...form.register('referralCode')} />
          <SubmitButton />
        </form>
        <OAuthButtons />
      </AuthCardContent>
    </Form>
  )
}

export function RegisterForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterFormComponent />
    </Suspense>
  )
}
