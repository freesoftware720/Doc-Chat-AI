import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewForm } from './review-form';
import { getUserReview } from '@/app/actions/reviews';

export default async function ReviewPage() {
    const existingReview = await getUserReview();

    return (
      <div className="p-4 md:p-6 space-y-6">
        <header>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">Leave a Review</h1>
            <p className="text-muted-foreground mt-1">We'd love to hear your feedback on your experience.</p>
        </header>

        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle>{existingReview ? 'Update Your Review' : 'Write a New Review'}</CardTitle>
                <CardDescription>
                    Your review might be featured on our homepage.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ReviewForm existingReview={existingReview} />
            </CardContent>
        </Card>
      </div>
    );
}
