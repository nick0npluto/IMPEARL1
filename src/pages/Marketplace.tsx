import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Star, Clock, DollarSign, Search, GitCompare, Building } from "lucide-react";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Freelancer {
  _id: string;
  email: string;
  freelancerProfile?: {
    name: string;
    expertise: string;
    yearsExperience: string;
    bio: string;
    hourlyRate?: number;
    availability: string;
    rating?: number;
    reviewCount?: number;
    profilePicture?: string;
  };
}

interface ServiceProvider {
  _id: string;
  email: string;
  serviceProviderProfile?: {
    companyName: string;
    description: string;
    industryFocus?: string[];
    integrations?: string[];
    rating?: number;
    reviewCount?: number;
  };
}

type ViewMode = "freelancers" | "service_providers";

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("freelancers");
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [filteredServiceProviders, setFilteredServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerSearch, setProviderSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    fetchTalent();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [searchQuery, experienceFilter, availabilityFilter, freelancers]);

  useEffect(() => {
    filterServiceProviders();
  }, [providerSearch, serviceProviders]);

  const fetchTalent = async () => {
    const token = ApiService.getToken();
    if (!token) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [freelancerRes, providerRes] = await Promise.all([
        ApiService.getFreelancers(),
        ApiService.getServiceProviders(),
      ]);
      if (freelancerRes.success) {
        setFreelancers(freelancerRes.freelancers || []);
      }
      if (providerRes.success) {
        setServiceProviders(providerRes.providers || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load marketplace data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const favoriteIds = ApiService.getFavoritesFromStorage();
    setFavorites(favoriteIds);
  };

  const toggleFavorite = (freelancerId: string) => {
    const isCurrentlyFavorited = favorites.includes(freelancerId);

    if (isCurrentlyFavorited) {
      const newFavorites = ApiService.removeFavorite(freelancerId);
      setFavorites(newFavorites);

      toast({
        title: "Removed from favorites",
        description: "Freelancer removed from your favorites",
      });
    } else {
      const newFavorites = ApiService.addFavorite(freelancerId);
      setFavorites(newFavorites);

      toast({
        title: "Added to favorites",
        description: "Freelancer added to your favorites",
      });
    }
  };

  const toggleCompare = (freelancerId: string) => {
    if (selectedForCompare.includes(freelancerId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== freelancerId));
    } else {
      if (selectedForCompare.length >= 4) {
        toast({
          title: "Comparison Limit",
          description: "You can compare up to 4 freelancers at once",
          variant: "destructive",
        });
        return;
      }
      setSelectedForCompare([...selectedForCompare, freelancerId]);
    }
  };

  const filterFreelancers = () => {
    let filtered = [...freelancers];

    if (searchQuery) {
      filtered = filtered.filter((f) => {
        const profile = f.freelancerProfile;
        if (!profile) return false;
        return (
          profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    if (experienceFilter !== "all") {
      filtered = filtered.filter((f) => f.freelancerProfile?.yearsExperience === experienceFilter);
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter((f) => f.freelancerProfile?.availability === availabilityFilter);
    }

    setFilteredFreelancers(filtered);
  };

  const filterServiceProviders = () => {
    let filtered = [...serviceProviders];
    if (providerSearch) {
      filtered = filtered.filter((provider) => {
        const profile = provider.serviceProviderProfile;
        if (!profile) return false;
        const haystack = [
          profile.companyName,
          profile.description,
          (profile.industryFocus || []).join(" "),
          (profile.integrations || []).join(" "),
        ].join(" ").toLowerCase();
        return haystack.includes(providerSearch.toLowerCase());
      });
    }
    setFilteredServiceProviders(filtered);
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

  const handleRequestEngagement = (targetType: "freelancer" | "service_provider", targetId: string) => {
    navigate("/post-job", { state: { targetType, targetId } });
  };

  if (authRequired) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <Card className="max-w-xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Sign in to browse talent</h2>
            <p className="text-muted-foreground mb-6">
              Please log in to view freelancers and service providers available on IMPEARL.
            </p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  const isFreelancerView = viewMode === "freelancers";
  const activeCount = isFreelancerView ? filteredFreelancers.length : filteredServiceProviders.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-foreground">
                  {isFreelancerView ? "Browse Freelancers" : "Browse Service Providers"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {isFreelancerView
                    ? "Find the perfect automation expert for your project"
                    : "Discover service providers, tools, and solutions for your business"}
                </p>
              </div>
              <div className="inline-flex rounded-full border border-border p-1 bg-muted/40">
                <Button
                  variant={isFreelancerView ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setViewMode("freelancers")}
                >
                  Freelancers
                </Button>
                <Button
                  variant={!isFreelancerView ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setViewMode("service_providers")}
                >
                  Service Providers
                </Button>
              </div>
            </div>
          </div>

          {isFreelancerView ? (
            <>
              <div className="mb-8 space-y-4 animate-slide-up">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, skills, or expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience</SelectItem>
                      <SelectItem value="0-1">Entry Level</SelectItem>
                      <SelectItem value="1-3">Intermediate</SelectItem>
                      <SelectItem value="3-5">Experienced</SelectItem>
                      <SelectItem value="5-10">Expert</SelectItem>
                      <SelectItem value="10+">Master</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Availability</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedForCompare.length > 0 && (
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {selectedForCompare.length} freelancer{selectedForCompare.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <Button
                      onClick={() => navigate("/compare", { state: { freelancerIds: selectedForCompare } })}
                      disabled={selectedForCompare.length < 2}
                    >
                      Compare Selected
                    </Button>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-muted-foreground">
                  {activeCount} freelancer{activeCount !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
                {filteredFreelancers.map((freelancer) => {
                  const profile = freelancer.freelancerProfile;
                  if (!profile) return null;
                  return (
                    <Card
                      key={freelancer._id}
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(freelancer._id);
                          }}
                          className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(freelancer._id)
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full bg-background/80 backdrop-blur-sm"
                        >
                          <Checkbox
                            checked={selectedForCompare.includes(freelancer._id)}
                            onCheckedChange={() => toggleCompare(freelancer._id)}
                          />
                        </div>
                      </div>

                      <div className="p-6" onClick={() => navigate(`/freelancer/${freelancer._id}`)}>
                        <div className="mb-4 flex justify-center">
                          {profile.profilePicture ? (
                            <img
                              src={profile.profilePicture}
                              alt={profile.name}
                              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                              <span className="text-2xl font-bold text-primary">{getInitials(profile.name)}</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-center mb-2 text-foreground">{profile.name}</h3>
                        <div className="flex justify-center mb-3">
                          <Badge variant="secondary">{getExperienceLabel(profile.yearsExperience)}</Badge>
                        </div>
                        <p className="text-sm text-primary font-medium text-center mb-3">{profile.expertise}</p>
                        <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-3 min-h-[60px]">
                          {profile.bio || "No bio provided"}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{(profile.rating || 0).toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({profile.reviewCount || 0})</span>
                          </div>

                          {profile.hourlyRate && (
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-semibold">${profile.hourlyRate}/hr</span>
                            </div>
                          )}

                          <div className="flex items-center justify-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="capitalize">{profile.availability.replace("-", " ")}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestEngagement("freelancer", freelancer._id);
                            }}
                          >
                            Request Engagement
                          </Button>
                          <Button className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {filteredFreelancers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground mb-4">No freelancers found matching your criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setExperienceFilter("all");
                      setAvailabilityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8 animate-slide-up">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by company, industry, or integrations..."
                      value={providerSearch}
                      onChange={(e) => setProviderSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-muted-foreground">
                  {activeCount} service provider{activeCount !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {filteredServiceProviders.map((provider) => {
                  const profile = provider.serviceProviderProfile;
                  if (!profile) return null;
                  return (
                    <Card key={provider._id} className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Building className="h-10 w-10 text-primary" />
                          <div>
                            <h3 className="text-2xl font-semibold text-foreground">{profile.companyName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {profile.industryFocus?.join(", ") || "General services"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                          {profile.description || "No description provided"}
                        </p>
                        {profile.integrations && profile.integrations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                              Integrations
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {profile.integrations.slice(0, 4).map((integration) => (
                                <Badge key={integration} variant="outline">
                                  {integration}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleRequestEngagement("service_provider", provider._id)}
                        >
                          Request Engagement
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {filteredServiceProviders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground mb-4">
                    No service providers found matching your criteria
                  </p>
                  <Button variant="outline" onClick={() => setProviderSearch("")}>Clear Search</Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
