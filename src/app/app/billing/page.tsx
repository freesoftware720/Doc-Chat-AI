import { getProfile } from "@/app/actions/profile";
import { getActivePaymentGateways } from "@/app/actions/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function BillingPage() {
    const profile = await getProfile();
    const gateways = await getActivePaymentGateways();

    const proPlanDetails = {
        name: "Pro Plan",
        price: "$19/month",
        description: "Unlock unlimited access and advanced features."
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Billing & Upgrade</h1>
                <p className="text-muted-foreground mt-1">Manage your subscription and upgrade your plan.</p>
            </header>
            
            <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold">
                                {(profile?.pro_credits ?? 0) > 0 ? `Pro (Credit)` : (profile?.subscription_plan ?? 'Free')}
                            </p>
                            {(profile?.pro_credits ?? 0) > 0 && (
                                <p className="text-sm text-muted-foreground mt-1">You have {profile.pro_credits} month(s) of Pro credits remaining.</p>
                            )}
                        </div>
                        <Badge variant={profile?.subscription_plan === 'Pro' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                            {profile?.subscription_plan === 'Pro' ? 'Active' : 'Free Tier'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {profile?.subscription_plan !== 'Pro' && (
                <Card className="bg-card/60 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle>Upgrade to Pro</CardTitle>
                        <CardDescription>{proPlanDetails.description} - <strong>{proPlanDetails.price}</strong></CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gateways.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {gateways.map(gateway => (
                                    <AccordionItem key={gateway.id} value={`item-${gateway.id}`} className="bg-card/40 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md mb-4 px-6">
                                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                {gateway.icon_url && <img src={gateway.icon_url} alt={gateway.name} className="h-6 w-6 rounded-full object-contain" />}
                                                <span>Pay with {gateway.name}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{gateway.instructions}</ReactMarkdown>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No online payment methods are configured currently.</p>
                                <p className="text-sm mt-1">Please contact support to upgrade your plan.</p>
                            </div>
                        )}
                       <p className="text-xs text-muted-foreground mt-4 text-center">
                            After making a payment, please contact support with your transaction details to have your account upgraded.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
