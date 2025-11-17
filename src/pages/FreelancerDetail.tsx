import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  Award,
  Mail,
  Heart,
  ArrowLeft,
  ExternalLink,
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

interface ReviewItem {
  _id: string;
  reviewerName?: string;
  reviewerType: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const FreelancerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFreelancer();
      checkFavorite();
    }
  }, [id]);

  const loadReviews = async (freelancerId: string) => {
    try {
      setReviewsLoading(true);
      const response = await ApiService.getReviews("freelancer", freelancerId);
      setReviews(response.reviews || []);
    } catch (error: any) {
      toast({
        title: "Unable to load reviews",
        description: error.message || "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFreelancer = async () => {
    try {
      const response = await ApiService.getFreelancer(id!);
      if (response.success) {
        setFreelancer(response.freelancer);
        if (response.freelancer?._id) {
          await loadReviews(response.freelancer._id);
        } else {
          setReviews([]);
          setReviewsLoading(false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load freelancer",
        variant: "destructive",
      });
      navigate("/marketplace");
      setReviews([]);
      setReviewsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = () => {
    const isFav = ApiService.isFavorite(id!);
    setIsFavorite(isFav);
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      ApiService.removeFavorite(id!);
      setIsFavorite(false);
      
      toast({
        title: "Removed from favorites",
        description: "Freelancer removed from your favorites",
      });
    } else {
      ApiService.addFavorite(id!);
      setIsFavorite(true);
      
      toast({
        title: "Added to favorites",
        description: "Freelancer added to your favorites",
      });
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please write a message to the freelancer",
        variant: "destructive",
      });
      return;
    }

    setSendingRequest(true);

    try {
      // TODO: Implement actual request sending API
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Request Sent",
        description: `Your request has been sent to ${freelancer?.freelancerProfile.name}`,
      });

      setRequestMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setSendingRequest(false);
    }
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
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return null;
  }

  const portfolioLinks = freelancer.freelancerProfile.portfolioLinks
    ?.split(",")
    .map((link) => link.trim())
    .filter((link) => link);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/marketplace")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          {/* Main Profile Card */}
          <Card className="p-8 mb-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                {freelancer.freelancerProfile.profilePicture ? (
                  <img
                    src={freelancer.freelancerProfile.profilePicture}
                    alt={freelancer.freelancerProfile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 mb-4">
                    <span className="text-4xl font-bold text-primary">
                      {getInitials(freelancer.freelancerProfile.name)}
                    </span>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={toggleFavorite}
                  className="w-full"
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {freelancer.freelancerProfile.name}
                    </h1>
                    <p className="text-lg text-primary font-medium mb-2">
                      {freelancer.freelancerProfile.expertise}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {getExperienceLabel(freelancer.freelancerProfile.yearsExperience)}
                  </Badge>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 mb-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">
                      {freelancer.freelancerProfile.rating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({freelancer.freelancerProfile.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Hourly Rate */}
                  {freelancer.freelancerProfile.hourlyRate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-lg">
                        ${freelancer.freelancerProfile.hourlyRate}/hr
                      </span>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="capitalize">
                      {freelancer.freelancerProfile.availability.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    About
                  </h3>
                  <p className="text-muted-foreground">
                    {freelancer.freelancerProfile.bio || "No bio provided"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Send Request to {freelancer.freelancerProfile.name}
                        </DialogTitle>
                        <DialogDescription>
                          Describe your project and requirements
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Hi, I'm interested in working with you on..."
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          className="min-h-[150px]"
                        />
                        <Button
                          onClick={handleSendRequest}
                          disabled={sendingRequest}
                          className="w-full"
                        >
                          {sendingRequest ? "Sending..." : "Send Request"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = `mailto:${freelancer.email}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Past Projects */}
          {freelancer.freelancerProfile.pastProjects && (
            <Card className="p-6 mb-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Past Projects
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {freelancer.freelancerProfile.pastProjects}
              </p>
            </Card>
          )}

          {/* Portfolio Links */}
          {portfolioLinks && portfolioLinks.length > 0 && (
            <Card className="p-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Portfolio & Links
              </h3>
              <div className="space-y-2">
                {portfolioLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {link}
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 animate-slide-up">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              Reviews & Feedback
            </h3>
            {reviewsLoading ? (
              <p className="text-muted-foreground">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet. Be the first to work with this talent.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{review.reviewerName || "Client"}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {review.reviewerType.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FreelancerDetail;
