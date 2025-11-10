import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, Wand2, Users } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              We're Here to Help
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get the support you need to succeed with IMPEARL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-slide-up">
            <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive guides and tutorials
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Docs
              </Button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">AI Chatbot</h3>
              <p className="text-sm text-muted-foreground mb-4">24/7 instant assistance</p>
              <Button variant="outline" size="sm" className="w-full">
                Start Chat
              </Button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Wand2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                Onboarding Wizard
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Step-by-step setup guide</p>
              <Button variant="outline" size="sm" className="w-full">
                Start Wizard
              </Button>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Human Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Talk to our expert team</p>
              <Button variant="default" size="sm" className="w-full">
                Contact Us
              </Button>
            </div>
          </div>

          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">
              Try Our AI Assistant
            </h2>
            <ChatInterface />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;
