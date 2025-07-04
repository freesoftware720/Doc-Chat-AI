
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import type { Plan } from "@/app/actions/billing";

export function PricingSection({ plans = [] }: { plans: Plan[] }) {
  const defaultHeadline = "Choose the Plan That's Right for You";
  const defaultSubheadline = "Simple, transparent pricing. No hidden fees.";

  if (plans.length === 0) {
    return (
        <section id="pricing" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                 <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{defaultHeadline}</h2>
                    <p className="mt-4 text-lg text-muted-foreground">{defaultSubheadline}</p>
                </div>
                <div className="text-center text-muted-foreground">
                    <p>No pricing plans are configured yet.</p>
                    <p className="text-sm">Please check back later.</p>
                </div>
            </div>
        </section>
    )
  }

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 gsap-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{defaultHeadline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {defaultSubheadline}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan: Plan) => (
            <Card key={plan.id} className={`rounded-2xl shadow-2xl bg-gradient-to-br from-card/60 to-card/20 flex flex-col gsap-pricing-card transition-colors duration-300 ${plan.is_popular ? "border-primary/50 shadow-primary/20 hover:border-primary" : "border-white/20 shadow-primary/10 hover:border-primary"}`}>
              <CardHeader className="p-8">
                {plan.is_popular && <div className="text-xs font-bold uppercase text-primary tracking-widest mb-2">Most Popular</div>}
                <CardTitle className="text-3xl font-headline tracking-tight">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold font-headline">{plan.currency_symbol}{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="pt-4 text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button size="lg" className="w-full text-lg h-12" variant={plan.is_popular ? "default" : "outline"} asChild>
                  <Link href="/auth/register">{plan.name === 'Free' ? 'Start for Free' : 'Go Pro'}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
