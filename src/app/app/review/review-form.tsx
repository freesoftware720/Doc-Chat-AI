'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { submitReview } from '@/app/actions/reviews';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './star-rating';
import type { Tables } from '@/lib/supabase/database.types';

const formSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  content: z.string().min(10, 'Review must be at least 10 characters.'),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? <Loader2 className="animate-spin" /> : 'Submit Review'}
    </Button>
  );
}

export function ReviewForm({ existingReview }: { existingReview: Tables<'reviews'> | null }) {
  const [state, formAction] = useActionState(submitReview, null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      content: existingReview?.content || '',
    },
  });

  useEffect(() => {
    if (state?.success) {
      toast({ title: 'Success', description: state.success });
    }
    if (state?.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
    }
  }, [state, toast]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8 max-w-2xl">
        <input type="hidden" name="rating" value={form.watch('rating')} />
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Your Rating</FormLabel>
              <FormControl>
                <Controller
                  control={form.control}
                  name="rating"
                  render={({ field: { onChange, value } }) => (
                    <StarRating value={value} onChange={onChange} />
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us what you think about the app..."
                  {...field}
                  rows={6}
                />
              </FormControl>
               <FormDescription>
                Your feedback helps us improve.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton />
      </form>
    </Form>
  );
}
