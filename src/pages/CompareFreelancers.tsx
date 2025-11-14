import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  DollarSign,
  Award,
  ArrowLeft,
  Mail,
  X,
} from "lucide-react";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Freelancer {
  _id: string;
  email: string;
  freelancerProfile: {
    name: string;
    expertise: string;
    yearsExperience: string;
    pastProjects: string;
    portfolioLinks: string;
    hourlyRate?: number;
    availability: string;
    profilePicture?: string;
    bio: string;
    rating: number;
    reviewCount: number;
  };
}

const CompareFreelancers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const freelancerIds = location.state?.freelancerIds || [];
    
    if (freelancerIds.length < 2) {
      toast({
        title: "Not Enough Freelancers",
        description: "Please select at least 2 freelancers to compare",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }

    fetchFreelancers(freelancerIds);
  }, [location]);

  const fetchFreelancers = async (ids: string[]) => {
    try {
      const promises = ids.map((id) => ApiService.getFreelancer(id));
      const responses = await Promise.all(promises);
      const fetchedFreelancers = responses
        .filter((r) => r.success)
        .map((r) => r.freelancer);
      setFreelancers(fetchedFreelancers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load freelancers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (id: string) => {
    const remaining = freelancers.filter((f) => f._id !== id);
    
    if (remaining.length < 2) {
      toast({
        title: "Minimum Required",
        description: "You need at least 2 freelancers to compare",
        variant: "destructive",
      });
      navigate("/marketplace");
      return;
    }

    setFreelancers(remaining);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceLabel = (exp: string) => {
    const labels: { [key: string]: string } = {
      "0-1": "Entry Level",
      "1-3": "Intermediate",
      "3-5": "Experienced",
      "5-10": "Expert",
      "10+": "Master",
    };
    return labels[exp] || exp;
  };

  const getExperienceScore = (exp: string) => {
    const scores: { [key: string]: number } = {
      "0-1": 1,
      "1-3": 2,
      "3-5": 3,
      "5-10": 4,
      "10+": 5,
    };
    return scores[exp] || 0;
  };

  const getAvailabilityScore = (avail: string) => {
    const scores: { [key: string]: number } = {
      "full-time": 5,
      "part-time": 4,
      "contract": 3,
      "hourly": 2,
      "not-available": 1,
    };
    return scores[avail] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading comparison...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/marketplace")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
              <h1 className="text-4xl font-bold mb-2">Compare Freelancers</h1>
              <p className="text-muted-foreground">
                Side-by-side comparison of {freelancers.length} freelancers
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${freelancers.length}, 1fr)` }}>
                {/* Header Row - Profile Pictures and Names */}
                <div className="sticky left-0 bg-background z-10"></div>
                {freelancers.map((freelancer) => (
                  <Card key={freelancer._id} className="p-6 relative">
                    <button
                      onClick={() => removeFromComparison(freelancer._id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>
                    
                    <div className="flex flex-col items-center mb-4">
                      {freelancer.freelancerProfile.profilePicture ? (
                        <img
                          src={freelancer.freelancerProfile.profilePicture}
                          alt={freelancer.freelancerProfile.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-primary/20 mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 mb-3">
                          <span className="text-xl font-bold text-primary">
                            {getInitials(freelancer.freelancerProfile.name)}
                          </span>
                        </div>
                      )}
                      <h3 className="font-bold text-center">
                        {freelancer.freelancerProfile.name}
                      </h3>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Expertise Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Expertise
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`expertise-${freelancer._id}`} className="p-4">
                    <p className="text-sm font-medium text-primary">
                      {freelancer.freelancerProfile.expertise}
                    </p>
                  </Card>
                ))}

                {/* Experience Level Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Experience Level
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`exp-${freelancer._id}`} className="p-4">
                    <Badge variant="secondary">
                      {getExperienceLabel(freelancer.freelancerProfile.yearsExperience)}
                    </Badge>
                    <div className="mt-2 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < getExperienceScore(freelancer.freelancerProfile.yearsExperience)
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </Card>
                ))}

                {/* Rating Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Rating
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`rating-${freelancer._id}`} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">
                        {freelancer.freelancerProfile.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {freelancer.freelancerProfile.reviewCount} reviews
                    </p>
                  </Card>
                ))}

                {/* Hourly Rate Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Hourly Rate
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`rate-${freelancer._id}`} className="p-4">
                    {freelancer.freelancerProfile.hourlyRate ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-bold text-lg">
                          ${freelancer.freelancerProfile.hourlyRate}
                        </span>
                        <span className="text-sm text-muted-foreground">/hr</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </Card>
                ))}

                {/* Availability Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Availability
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`avail-${freelancer._id}`} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="capitalize font-medium">
                        {freelancer.freelancerProfile.availability.replace("-", " ")}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < getAvailabilityScore(freelancer.freelancerProfile.availability)
                              ? "bg-blue-600"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </Card>
                ))}

                {/* Bio Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  About
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`bio-${freelancer._id}`} className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {freelancer.freelancerProfile.bio || "No bio provided"}
                    </p>
                  </Card>
                ))}

                {/* Actions Row */}
                <div className="sticky left-0 bg-background z-10 flex items-center font-semibold p-4 border-b">
                  Actions
                </div>
                {freelancers.map((freelancer) => (
                  <Card key={`actions-${freelancer._id}`} className="p-4">
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompareFreelancers;
