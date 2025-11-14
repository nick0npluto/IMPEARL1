import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Briefcase, DollarSign, Clock, Send } from "lucide-react";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  requirements: string;
  budget: string;
  budgetType: string;
  duration: string;
  experienceLevel: string;
  skills: string;
  postedDate: string;
  status: string;
  applications: any[];
}

const BrowseJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [proposal, setProposal] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, categoryFilter, jobs]);

  const loadJobs = () => {
    const savedJobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    setJobs(savedJobs.filter((job: Job) => job.status === "open"));
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((job) => job.category === categoryFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async () => {
    if (!proposal.trim()) {
      toast({
        title: "Proposal Required",
        description: "Please write a proposal to apply for this job",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const application = {
        id: Date.now().toString(),
        freelancerId: user.id,
        freelancerName: user.name || "Freelancer",
        proposal,
        appliedDate: new Date().toISOString(),
        status: "pending",
      };

      // Add application to job
      const savedJobs = JSON.parse(localStorage.getItem("jobs") || "[]");
      const updatedJobs = savedJobs.map((job: Job) => {
        if (job.id === selectedJob?.id) {
          return {
            ...job,
            applications: [...(job.applications || []), application],
          };
        }
        return job;
      });

      localStorage.setItem("jobs", JSON.stringify(updatedJobs));

      toast({
        title: "Application Sent",
        description: "Your proposal has been submitted successfully!",
      });

      setProposal("");
      setSelectedJob(null);
      loadJobs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getDurationLabel = (duration: string) => {
    const labels: { [key: string]: string } = {
      "less-than-week": "< 1 week",
      "1-2-weeks": "1-2 weeks",
      "2-4-weeks": "2-4 weeks",
      "1-3-months": "1-3 months",
      "3-6-months": "3-6 months",
      "more-than-6-months": "> 6 months",
    };
    return labels[duration] || duration;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Browse Jobs
            </h1>
            <p className="text-xl text-muted-foreground">
              Find your next project opportunity
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 animate-slide-up">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Job Listings */}
          <div className="space-y-4 animate-slide-up">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Posted {formatDate(job.postedDate)}
                        </p>
                        <Badge variant="secondary" className="mb-3">
                          {job.category.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {job.skills && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.split(",").slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">
                          ${job.budget} {job.budgetType === "hourly" ? "/hr" : ""}
                        </span>
                      </div>

                      {job.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{getDurationLabel(job.duration)}</span>
                        </div>
                      )}

                      {job.experienceLevel && (
                        <Badge variant="secondary">
                          {job.experienceLevel.charAt(0).toUpperCase() +
                            job.experienceLevel.slice(1)}
                        </Badge>
                      )}

                      <span className="text-muted-foreground">
                        {job.applications?.length || 0} proposals
                      </span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedJob(job)}>
                        <Send className="mr-2 h-4 w-4" />
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Apply for Job</DialogTitle>
                        <DialogDescription>
                          Submit your proposal for: {selectedJob?.title}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        {/* Job Details */}
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          <p className="font-semibold">{selectedJob?.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {selectedJob?.description}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="font-semibold">
                              ${selectedJob?.budget}{" "}
                              {selectedJob?.budgetType === "hourly" ? "/hr" : ""}
                            </span>
                            {selectedJob?.duration && (
                              <span>{getDurationLabel(selectedJob.duration)}</span>
                            )}
                          </div>
                        </div>

                        {/* Proposal */}
                        <div>
                          <Label className="text-foreground mb-2 block">
                            Your Proposal <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            placeholder="Explain why you're the best fit for this job, your relevant experience, and your approach to the project..."
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            className="min-h-[200px]"
                          />
                        </div>

                        <Button
                          onClick={handleApply}
                          disabled={applying}
                          className="w-full"
                        >
                          {applying ? "Submitting..." : "Submit Proposal"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <Card className="p-12 text-center">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
              <p className="text-muted-foreground mb-4">
                No jobs match your current filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default BrowseJobs;
