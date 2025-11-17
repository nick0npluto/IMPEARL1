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

const FreelancerProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    expertise: "",
    pastProjects: "",
    yearsExperience: "",
    portfolioLinks: "",
    hourlyRate: "",
    availability: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.expertise || !formData.yearsExperience) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in name, expertise, and years of experience.",
        variant: "destructive",
      });
      return;
    }

    // Validate hourly rate is numeric if provided
    if (formData.hourlyRate && isNaN(Number(formData.hourlyRate))) {
      toast({
        title: "Invalid Rate",
        description: "Hourly rate must be a number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await ApiService.createFreelancerProfile(formData);

      try {
        await refresh();
      } catch (err) {
        console.error("Failed to sync auth state after freelancer profile", err);
      }

      toast({
        title: "Profile Created",
        description: "Your freelancer profile has been saved successfully.",
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
              Create Freelancer Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Showcase your expertise and get discovered by businesses
            </p>
          </div>

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="expertise" className="text-foreground">
                  Expertise & Skills <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expertise"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g., AI automation, workflow design, API integration"
                  className="mt-2"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              <div>
                <Label htmlFor="yearsExperience" className="text-foreground">
                  Years of Experience <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.yearsExperience}
                  onValueChange={(value) => setFormData({ ...formData, yearsExperience: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pastProjects" className="text-foreground">
                  Past Projects
                </Label>
                <Textarea
                  id="pastProjects"
                  value={formData.pastProjects}
                  onChange={(e) => setFormData({ ...formData, pastProjects: e.target.value })}
                  placeholder="Describe your notable past projects and achievements..."
                  className="mt-2 min-h-[120px]"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="portfolioLinks" className="text-foreground">
                  Portfolio Links
                </Label>
                <Input
                  id="portfolioLinks"
                  value={formData.portfolioLinks}
                  onChange={(e) => setFormData({ ...formData, portfolioLinks: e.target.value })}
                  placeholder="https://portfolio.com, https://github.com/username"
                  className="mt-2"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate multiple links with commas
                </p>
              </div>

              <div>
                <Label htmlFor="hourlyRate" className="text-foreground">
                  Hourly Rate (USD)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="50"
                  className="mt-2"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="availability" className="text-foreground">
                  Availability
                </Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time (40+ hrs/week)</SelectItem>
                    <SelectItem value="part-time">Part-time (20-40 hrs/week)</SelectItem>
                    <SelectItem value="contract">Contract basis</SelectItem>
                    <SelectItem value="hourly">Hourly projects</SelectItem>
                    <SelectItem value="not-available">Not currently available</SelectItem>
                  </SelectContent>
                </Select>
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

export default FreelancerProfile;
