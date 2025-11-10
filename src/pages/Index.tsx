import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import { ArrowRight, Brain, Users, Cog } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 min-h-[90vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto text-center animate-fade-in">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              IMPEARL
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/features">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/features">See How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Bridge Small Business & Enterprise Automation
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              An intelligent platform that bridges small businesses and enterprise-level automation.
              Whether you're a startup or a growing company, IMPEARL uses AI to analyze your goals
              and connect you with the right solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <FeatureCard
              icon={Brain}
              title="AI Recommendations"
              description="Get personalized tool and automation recommendations based on your business needs and goals."
            />
            <FeatureCard
              icon={Users}
              title="Freelancer Connections"
              description="Connect with vetted freelancers who specialize in implementing the solutions you need."
            />
            <FeatureCard
              icon={Cog}
              title="Automation Planning"
              description="Generate comprehensive automation plans tailored to your industry and business size."
            />
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Everything You Need to Automate & Scale
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            From AI-powered recommendations to payment processing, we've got all the tools you need.
          </p>
          <Button variant="default" size="lg" asChild>
            <Link to="/features">
              Explore All Features <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="container mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
            IMPEARL
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering businesses with AI-driven automation and expert connections
          </p>
          <div className="flex justify-center space-x-6">
            <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
