import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AIFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  ctaText: string;
  badgeText?: string;
  accentColor?: "teal" | "amber" | "blue" | "rose";
}

export function AIFeatureCard({
  icon: Icon,
  title,
  description,
  href,
  ctaText,
  badgeText,
  accentColor = "teal",
}: AIFeatureCardProps) {
  const colorStyles = {
    teal: "bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white",
    amber: "bg-[var(--accent)]/15 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black",
    blue: "bg-[var(--secondary)]/10 text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white",
    rose: "bg-[var(--danger)]/10 text-[var(--danger)] group-hover:bg-[var(--danger)] group-hover:text-white",
  };

  return (
    <Card className="group hover:border-[var(--primary)]/50 hover:shadow-lg transition-all flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${colorStyles[accentColor]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {badgeText && (
            <Badge size="sm" variant="outline">
              {badgeText}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription className="text-xs leading-relaxed mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={href}>
          <Button variant="outline" size="sm" className="w-full justify-between group-hover:border-[var(--primary)]">
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
