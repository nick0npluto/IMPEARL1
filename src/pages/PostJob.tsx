import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
import { useToast } from "@/hooks/use-toast";
import { Briefcase, DollarSign, Clock, ArrowLeft } from "lucide-react";

const PostJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posting, setPosting] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    category: "",
    description: "",
    requirements: "",
    budget: "",
    budgetType: "fixed",
    duration: "",
    experienceLevel: "",
    skills: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobData.title || !jobData.category || !jobData.description || !jobData.budget) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);

    try {
      // TODO: Implement actual job posting API
      // For now, save to localStorage
      const existingJobs = JSON.parse(localStorage.getItem("jobs") || "[]");
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        postedBy: JSON.parse(localStorage.getItem("user") || "{}").id,
        postedDate: new Date().toISOString(),
        status: "open",
        applications: [],
      };
      
      existingJobs.push(newJob);
      localStorage.setItem("jobs", JSON.stringify(existingJobs));

      toast({
        title: "Job Posted",
        description: "Your job has been posted successfully!",
      });

      navigate("/my-jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                Post a Job
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Find the perfect freelancer for your project
            </p>
          </div>

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <Label htmlFor="title" className="text-foreground">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={jobData.title}
                  onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                  placeholder="e.g., Need AI Automation Expert for Workflow Setup"
                  className="mt-2"
                  required
                  disabled={posting}
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-foreground">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={jobData.category}
                  onValueChange={(value) => setJobData({ ...jobData, category: value })}
                  disabled={posting}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai-automation">AI & Automation</SelectItem>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="mobile-development">Mobile Development</SelectItem>
                    <SelectItem value="data-analysis">Data Analysis</SelectItem>
                    <SelectItem value="workflow-design">Workflow Design</SelectItem>
                    <SelectItem value="api-integration">API Integration</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-foreground">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={jobData.description}
                  onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                  placeholder="Describe your project, what needs to be done, and any specific requirements..."
                  className="mt-2 min-h-[150px]"
                  required
                  disabled={posting}
                />
              </div>

              {/* Requirements */}
              <div>
                <Label htmlFor="requirements" className="text-foreground">
                  Requirements
                </Label>
                <Textarea
                  id="requirements"
                  value={jobData.requirements}
                  onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                  placeholder="List specific requirements, qualifications, or deliverables..."
                  className="mt-2 min-h-[100px]"
                  disabled={posting}
                />
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills" className="text-foreground">
                  Required Skills
                </Label>
                <Input
                  id="skills"
                  value={jobData.skills}
                  onChange={(e) => setJobData({ ...jobData, skills: e.target.value })}
                  placeholder="e.g., Python, API Integration, Workflow Automation"
                  className="mt-2"
                  disabled={posting}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas
                </p>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetType" className="text-foreground">
                    Budget Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={jobData.budgetType}
                    onValueChange={(value) => setJobData({ ...jobData, budgetType: value })}
                    disabled={posting}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select budget type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-foreground">
                    Budget (USD) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      value={jobData.budget}
                      onChange={(e) => setJobData({ ...jobData, budget: e.target.value })}
                      placeholder={jobData.budgetType === 'hourly' ? '50/hr' : '1000'}
                      className="pl-10"
                      min="0"
                      step="0.01"
                      required
                      disabled={posting}
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" className="text-foreground">
                  Project Duration
                </Label>
                <Select
                  value={jobData.duration}
                  onValueChange={(value) => setJobData({ ...jobData, duration: value })}
                  disabled={posting}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Estimated project duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                    <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-3-months">1-3 months</SelectItem>
                    <SelectItem value="3-6-months">3-6 months</SelectItem>
                    <SelectItem value="more-than-6-months">More than 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div>
                <Label htmlFor="experienceLevel" className="text-foreground">
                  Experience Level Required
                </Label>
                <Select
                  value={jobData.experienceLevel}
                  onValueChange={(value) => setJobData({ ...jobData, experienceLevel: value })}
                  disabled={posting}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="any">Any Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={posting}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  {posting ? 'Posting...' : 'Post Job'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                  disabled={posting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PostJob;
