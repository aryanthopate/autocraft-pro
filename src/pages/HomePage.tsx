import { PublicLayout } from "@/components/layout/PublicLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { SocialProofStrip } from "@/components/home/SocialProofStrip";
import { CTASection } from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeatureShowcase />
      <ProcessTimeline />
      <SocialProofStrip />
      <CTASection />
    </PublicLayout>
  );
}
