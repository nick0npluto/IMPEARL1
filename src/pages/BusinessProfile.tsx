import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import ApiService from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

const BusinessProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    companySize: "",
    goals: "",
    requiredSkills: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.industry || !formData.goals) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in business name, industry, and goals/objectives.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await ApiService.createBusinessProfile(formData);

      try {
        await refresh();
      } catch (err) {
        console.error("Failed to sync auth state after business profile", err);
      }

      toast({
        title: "Profile Created",
        description: "Your business profile has been saved successfully.",
      });

      // Redirect to dashboard
      navigate('/dashboard');
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Create Business Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Tell us about your business to get personalized recommendations
            </p>
          </div>

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="businessName" className="text-foreground">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Enter your business name"
                  className="mt-2"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="industry" className="text-foreground">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="hospitality">Hospitality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companySize" className="text-foreground">
                  Company Size
                </Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goals" className="text-foreground">
                  Goals & Objectives <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="What are your business goals and objectives?"
                  className="mt-2 min-h-[100px]"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="requiredSkills" className="text-foreground">
                  Required Skills
                </Label>
                <Input
                  id="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g., AI integration, workflow automation, data analysis"
                  className="mt-2"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div>
                <Label htmlFor="website" className="text-foreground">
                  Website (Optional)
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-2"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">
                  Company Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about your company..."
                  className="mt-2 min-h-[120px]"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => navigate("/register")}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default BusinessProfile;
