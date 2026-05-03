import PublicLayout from "@/src/components/layouts/public/PublicLayout";
import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { ProblemSection } from "@/src/features/landing/components/ProblemSection";
import { CoreFeaturesSection} from "@/src/features/landing/components/CoreFeaturesSection";
import { SolutionSection} from "@/src/features/landing/components/SolutionSection";
import { ProductCatalogSection } from "@/src/features/landing/components/ProductCatalogSection";
import { ArticleSection } from "@/src/features/landing/components/ArticleSection";
// import { TestimonialSection } from "@/src/features/landing/components/TestimonialSection";
import { FAQSection } from "@/src/features/landing/components/FAQSection";
import { CTASection } from "@/src/features/landing/components/CTASection";

export default function LandingPage() {
    return (
        <PublicLayout>
            <HeroSection />
            <ProblemSection />
            <SolutionSection />
            <CoreFeaturesSection />
            <ProductCatalogSection />
            <ArticleSection />
            <CTASection />
            <FAQSection />
            {/* <TestimonialSection /> */}
        </PublicLayout>
    );
}
