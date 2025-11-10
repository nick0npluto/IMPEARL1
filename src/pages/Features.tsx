import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import {
  User,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  FileText,
  Calculator,
  Star,
  Bot,
  FileCode,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: User,
      title: "Business & Freelancer Profile Setup",
      description:
        "Create comprehensive profiles that showcase your business needs or freelance expertise. Smart matching powered by AI.",
    },
    {
      icon: MessageSquare,
      title: "AI-Assisted Q&A and Recommendations",
      description:
        "Interactive questionnaire that analyzes your business and provides personalized automation and tool recommendations.",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace Comparison",
      description:
        "Compare automation tools, services, and freelancers side-by-side. Filter by price, features, ratings, and compatibility.",
    },
    {
      icon: CreditCard,
      title: "Payment Center",
      description:
        "Secure payment processing for hiring freelancers and purchasing automation tools. Integrated invoicing and receipts.",
    },
    {
      icon: FileText,
      title: "Industry Templates",
      description:
        "Pre-built automation templates for various industries. Customize and deploy proven solutions for your sector.",
    },
    {
      icon: Calculator,
      title: "Cost Calculator",
      description:
        "Calculate ROI and costs for different automation solutions. Compare investment vs. expected returns over time.",
    },
    {
      icon: Star,
      title: "Community Ratings",
      description:
        "Real user reviews and ratings for tools and freelancers. Make informed decisions based on community feedback.",
    },
    {
      icon: Bot,
      title: "Chatbot Support",
      description:
        "24/7 AI chatbot assistance for questions about features, recommendations, and troubleshooting.",
    },
    {
      icon: FileCode,
      title: "Base Model Generation",
      description:
        "Generate comprehensive automation plans and workflows tailored to your specific business requirements.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Powerful Features for Modern Business
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to discover, implement, and scale automation solutions for your
              business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
