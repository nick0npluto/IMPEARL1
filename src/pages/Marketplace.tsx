import { useState, useEffect } from "react";
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
import { Heart, Star, Clock, DollarSign, Search, GitCompare } from "lucide-react";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Freelancer {
  _id: string;
  email: string;
  freelancerProfile: {
    name: string;
    expertise: string;
    yearsExperience: string;
    bio: string;
    hourlyRate?: number;
    availability: string;
    rating: number;
    reviewCount: number;
    profilePicture?: string;
  };
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    fetchFreelancers();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [searchQuery, experienceFilter, availabilityFilter, freelancers]);

  const fetchFreelancers = async () => {
    try {
      const response = await ApiService.getFreelancers();
      if (response.success) {
        setFreelancers(response.freelancers);
      }
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

  const loadFavorites = () => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (freelancerId: string) => {
    const newFavorites = favorites.includes(freelancerId)
      ? favorites.filter((id) => id !== freelancerId)
      : [...favorites, freelancerId];
    saveFavorites(newFavorites);
    
    toast({
      title: favorites.includes(freelancerId) ? "Removed from favorites" : "Added to favorites",
      description: favorites.includes(freelancerId) 
        ? "Freelancer removed from your favorites" 
        : "Freelancer added to your favorites",
    });
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.freelancerProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.freelancerProfile.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.freelancerProfile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Experience filter
    if (experienceFilter !== "all") {
      filtered = filtered.filter((f) => f.freelancerProfile.yearsExperience === experienceFilter);
    }

    // Availability filter
    if (availabilityFilter !== "all") {
      filtered = filtered.filter((f) => f.freelancerProfile.availability === availabilityFilter);
    }

    setFilteredFreelancers(filtered);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading freelancers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Browse Freelancers
            </h1>
            <p className="text-xl text-muted-foreground">
              Find the perfect automation expert for your project
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4 animate-slide-up">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, skills, or expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Experience Filter */}
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

              {/* Availability Filter */}
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

            {/* Compare Button */}
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

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Freelancer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {filteredFreelancers.map((freelancer) => (
              <Card
                key={freelancer._id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Favorite and Compare Controls */}
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

                <div
                  onClick={() => navigate(`/freelancer/${freelancer._id}`)}
                  className="p-6"
                >
                  {/* Profile Picture */}
                  <div className="mb-4 flex justify-center">
                    {freelancer.freelancerProfile.profilePicture ? (
                      <img
                        src={freelancer.freelancerProfile.profilePicture}
                        alt={freelancer.freelancerProfile.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                        <span className="text-2xl font-bold text-primary">
                          {getInitials(freelancer.freelancerProfile.name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-center mb-2 text-foreground">
                    {freelancer.freelancerProfile.name}
                  </h3>

                  {/* Experience Badge */}
                  <div className="flex justify-center mb-3">
                    <Badge variant="secondary">
                      {getExperienceLabel(freelancer.freelancerProfile.yearsExperience)}
                    </Badge>
                  </div>

                  {/* Expertise */}
                  <p className="text-sm text-primary font-medium text-center mb-3">
                    {freelancer.freelancerProfile.expertise}
                  </p>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-3 min-h-[60px]">
                    {freelancer.freelancerProfile.bio || "No bio provided"}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {freelancer.freelancerProfile.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({freelancer.freelancerProfile.reviewCount})
                      </span>
                    </div>

                    {/* Hourly Rate */}
                    {freelancer.freelancerProfile.hourlyRate && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">
                          ${freelancer.freelancerProfile.hourlyRate}/hr
                        </span>
                      </div>
                    )}

                    {/* Availability */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">
                        {freelancer.freelancerProfile.availability.replace("-", " ")}
                      </span>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredFreelancers.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                No freelancers found matching your criteria
              </p>
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
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
