import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";
const Support = () => {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-12">
          <div className="text-center animate-fade-in space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Support Options</h1>
            <p className="text-xl text-muted-foreground">
              Choose AI chat for quick answers or book time with the IMPEARL support team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">IMPEARL AI Chatbot</h3>
                  <p className="text-sm text-muted-foreground">
                    24/7 assistance for product questions, Stripe payments, and automation tips.
                  </p>
                </div>
              </div>
              <Button className="w-full" variant="secondary" onClick={() => window.open("https://calendly.com/impearl-support/", "_blank")}>
                Open AI Chatbot
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Human Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Book a live Zoom call with an IMPEARL specialist for onboarding or troubleshooting.
                  </p>
                </div>
              </div>
              <Button className="w-full" asChild>
                <a href="https://calendly.com/impearl-support/" target="_blank" rel="noreferrer">
                  Schedule a call
                </a>
              </Button>
            </Card>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Support;
