import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { ArrowLeft, Rocket } from "lucide-react";

const ServiceProviderProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    industryFocus: "",
    integrations: "",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.description) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide your company name and a description of your services.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await ApiService.createServiceProviderProfile({
        companyName: formData.companyName,
        websiteUrl: formData.websiteUrl,
        industryFocus: formData.industryFocus
          ? formData.industryFocus.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        integrations: formData.integrations
          ? formData.integrations.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        description: formData.description,
      });

      toast({
        title: "Profile Created",
        description: "Your service provider profile is now live.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 flex items-start justify-between">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Service Provider Profile
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Showcase your SaaS products or packaged services to IMPEARL businesses
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/register")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter your company or brand name"
                  className="mt-2"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-2"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="industryFocus">Industry Focus</Label>
                <Input
                  id="industryFocus"
                  value={formData.industryFocus}
                  onChange={(e) => setFormData({ ...formData, industryFocus: e.target.value })}
                  placeholder="e.g., retail automation, logistics, hospitality"
                  className="mt-2"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">Separate industries with commas</p>
              </div>

              <div>
                <Label htmlFor="integrations">Integrations</Label>
                <Input
                  id="integrations"
                  value={formData.integrations}
                  onChange={(e) => setFormData({ ...formData, integrations: e.target.value })}
                  placeholder="e.g., Salesforce, Hubspot, Zapier"
                  className="mt-2"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">Separate integrations with commas</p>
              </div>

              <div>
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your offerings, differentiators, and customer outcomes"
                  className="mt-2 min-h-[150px]"
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ServiceProviderProfile;
