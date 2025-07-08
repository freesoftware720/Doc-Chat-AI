
import { getActivePaymentGateways, getActivePlans } from "@/app/actions/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle } from "lucide-react";
import { getUserSubscriptionStatus } from "@/app/actions/subscriptions";
import { format } from "date-fns";
import { PaymentSubmissionDialog } from "./payment-submission-dialog";
import { CancelSubscriptionButton } from "./cancel-subscription-button";

function StatusCard({ request }: { request: any }) {
    if (!request) return null;

    const variant = {
        pending: "default",
        approved: "default",
        rejected: "destructive",
    }[request.status];

    const icon = {
        pending: <Clock className="h-4 w-4" />,
        approved: <Check className="h-4 w-4" />,
        rejected: <AlertCircle className="h-4 w-4" />,
    }[request.status];

    const title = {
        pending: "Request Under Review",
        approved: "Subscription Activated",
        rejected: "Request Rejected",
    }[request.status];

    return (
        <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon} {title}
                </CardTitle>
                <CardDescription>
                    Submitted on {format(new Date(request.created_at), "PPP")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>You submitted a request to upgrade to the <strong>{request.plans.name}</strong> plan.</p>
                {request.status === 'pending' && <p className="text-muted-foreground mt-2 text-sm">We are currently reviewing your payment. This usually takes up to 24 hours. Your account will be upgraded automatically upon approval.</p>}
                {request.status === 'approved' && <p className="text-muted-foreground mt-2 text-sm">Your request was approved on {format(new Date(request.reviewed_at), "PPP")}. You are now on the {request.plans.name} plan.</p>}
                {request.status === 'rejected' && (
                    <div className="mt-2 text-destructive-foreground/80">
                        <p className="text-sm">Your request was rejected. Reason:</p>
                        <blockquote className="border-l-4 border-destructive pl-4 py-2 mt-1 bg-destructive/20 text-sm">
                           {request.rejection_reason || 'No reason provided.'}
                        </blockquote>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default async function BillingPage() {
    const { profile, latestRequest, hasPendingRequest } = await getUserSubscriptionStatus();
    const gateways = await getActivePaymentGateways();
    const plans = await getActivePlans();
    const paidPlans = plans.filter(p => p.price > 0);

    const currentPlanName = (profile?.pro_credits ?? 0) > 0 ? `Pro (Credit)` : (profile?.subscription_plan ?? 'Basic');
    const isPaidSubscriber = typeof profile?.subscription_plan === 'string' && profile.subscription_plan !== 'Basic';

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Billing &amp; Plans</h1>
                <p className="text-muted-foreground mt-1">Manage your subscription and change your plan.</p>
            </header>
            
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold">{currentPlanName}</p>
                            {(profile?.pro_credits ?? 0) > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">You have {profile.pro_credits} month(s) of Pro credits remaining.</p>
                            )}
                        </div>
                        <Badge variant={isPaidSubscriber ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                            {isPaidSubscriber ? 'Active' : 'Basic Tier'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {isPaidSubscriber && !hasPendingRequest && (
                 <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Cancel Subscription</CardTitle>
                        <CardDescription>You can cancel your subscription at any time.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Downgrade to the Basic plan. This action is effective immediately.</p>
                        <CancelSubscriptionButton />
                    </CardContent>
                </Card>
            )}
            
            {hasPendingRequest ? (
                <StatusCard request={latestRequest} />
            ) : (
                <>
                {latestRequest?.status === 'rejected' && <StatusCard request={latestRequest} />}

                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Available Plans</CardTitle>
                        <CardDescription>Choose a plan that fits your needs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {paidPlans.map(plan => {
                                const isCurrentPlan = plan.name === profile?.subscription_plan;
                                return (
                                <div key={plan.id}>
                                    <Card className="flex flex-col relative">
                                        {isCurrentPlan && (
                                            <Badge className="absolute top-4 right-4 z-10">Current Plan</Badge>
                                        )}
                                        <CardHeader>
                                            <CardTitle>{plan.name}</CardTitle>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">{plan.currency_symbol}{plan.price}</span>
                                                <span className="text-muted-foreground">{plan.period}</span>
                                            </div>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <ul className="space-y-2">
                                                {plan.features.map(feature => (
                                                    <li key={feature} className="flex items-start gap-2">
                                                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                                        <span className="text-sm text-muted-foreground">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    
                                    {!isCurrentPlan && (
                                        <div className="mt-4">
                                            <h3 className="text-base font-semibold mb-2 ml-1">Payment Methods:</h3>
                                            {gateways.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {gateways.map(gateway => (
                                                        <PaymentSubmissionDialog key={gateway.id} plan={plan} gateway={gateway}>
                                                            <Button variant="outline" className="w-full justify-start h-12">
                                                                {gateway.icon_url && <img src={gateway.icon_url} alt={gateway.name} className="h-6 w-6 mr-3 rounded-full object-contain" />}
                                                                Pay with {gateway.name}
                                                            </Button>
                                                        </PaymentSubmissionDialog>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                                    <p>No online payment methods are configured currently.</p>
                                                    <p className="text-sm mt-1">Please contact support to upgrade your plan.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </CardContent>
                </Card>
                </>
            )}
        </div>
    );
}
