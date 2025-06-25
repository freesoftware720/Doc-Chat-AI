
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const defaultContent = {
    headline: "Choose the Plan That's Right for You",
    subheadline: "Simple, transparent pricing. No hidden fees.",
    plans: [
        {
            name: "Free",
            price: "$0",
            period: "/ month",
            description: "For individuals and small projects to get a taste of AI power.",
            features: [
            "3 PDF uploads / month",
            "50 questions / month",
            "2MB file size limit",
            "Community support",
            ],
            cta: "Start for Free",
            link: "/app",
            isPopular: false,
        },
        {
            name: "Pro",
            price: "$19",
            period: "/ month",
            description: "For professionals and teams who need unlimited power.",
            features: [
            "Unlimited PDF uploads",
            "Unlimited questions",
            "32MB file size limit",
            "Priority email support",
            "Advanced AI models",
            ],
            cta: "Go Pro",
            link: "/app",
            isPopular: true,
        },
    ]
};

type Plan = {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    cta: string;
    link: string;
    isPopular: boolean;
}

export function PricingSection({ content = defaultContent }: { content?: typeof defaultContent }) {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 gsap-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">{content.headline}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {content.subheadline}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {content.plans.map((plan: Plan) => (
            <Card key={plan.name} className={`rounded-2xl shadow-2xl bg-gradient-to-br from-card/60 to-card/20 border-white/20 flex flex-col gsap-pricing-card ${plan.isPopular ? "shadow-primary/20 border-primary/50" : "shadow-primary/10"}`}>
              <CardHeader className="p-8">
                {plan.isPopular && <div className="text-xs font-bold uppercase text-primary tracking-widest mb-2">Most Popular</div>}
                <CardTitle className="text-3xl font-headline tracking-tight">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold font-headline">{plan.price}</span>
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
                <Button size="lg" className="w-full text-lg h-12" variant={plan.isPopular ? "default" : "outline"} asChild>
                  <Link href={plan.link}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
