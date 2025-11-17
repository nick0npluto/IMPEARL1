import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Briefcase, Users, ArrowLeft } from "lucide-react";

interface FreelancerOption {
  _id: string;
  email: string;
  freelancerProfile?: {
    name: string;
    expertise: string;
    yearsExperience: string;
  };
}

interface ServiceProviderOption {
  _id: string;
  email: string;
  serviceProviderProfile?: {
    companyName: string;
    description: string;
  };
}

type TargetType = "freelancer" | "service_provider";

const PostJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillAppliedRef = useRef(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>("freelancer");
  const [freelancers, setFreelancers] = useState<FreelancerOption[]>([]);
  const [providers, setProviders] = useState<ServiceProviderOption[]>([]);
  const [formData, setFormData] = useState({
    targetId: "",
    title: "",
    description: "",
    initialPrice: "",
    currency: "USD",
    proposedTerms: "",
  });

  useEffect(() => {
    const loadTargets = async () => {
      try {
        const [freelancerRes, providerRes] = await Promise.all([
          ApiService.getFreelancers(),
          ApiService.getServiceProviders(),
        ]);
        setFreelancers(freelancerRes.freelancers || []);
        setProviders(providerRes.providers || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Unable to load profiles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTargets();
  }, [toast]);

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const state = location.state as { targetType?: TargetType; targetId?: string } | null;
    if (state?.targetType) {
      setTargetType(state.targetType);
    }
    if (state?.targetId) {
      setFormData((prev) => ({ ...prev, targetId: state.targetId }));
    }
    if (state?.targetType || state?.targetId) {
      prefillAppliedRef.current = true;
    }
  }, [location.state]);

  const availableTargets = useMemo(() => {
    return targetType === "freelancer" ? freelancers : providers;
  }, [freelancers, providers, targetType]);

  const selectedTarget = useMemo(() => {
    return availableTargets.find((target) => target._id === formData.targetId);
  }, [availableTargets, formData.targetId]);

  const handleTargetTypeChange = (value: TargetType) => {
    setTargetType(value);
    setFormData((prev) => ({ ...prev, targetId: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetId) {
      toast({
        title: "Select a target",
        description: "Choose a freelancer or service provider to send the request",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.initialPrice) {
      toast({
        title: "Missing information",
        description: "Please complete the title, description, and budget fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      await ApiService.createEngagement({
        targetType,
        targetId: formData.targetId,
        title: formData.title,
        description: formData.description,
        initialPrice: Number(formData.initialPrice),
        currency: formData.currency,
        proposedTerms: formData.proposedTerms,
      });

      toast({
        title: "Engagement Sent",
        description: "Your engagement request has been sent successfully.",
      });

      navigate("/engagements");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to create engagement request.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const user = ApiService.getUser();
  const isBusiness = user?.userType === "business";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 flex items-start justify-between">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Engagement Request
                  </p>
                  <h1 className="text-4xl font-bold text-foreground">
                    Connect with Talent
                  </h1>
                </div>
              </div>
              <p className="text-xl text-muted-foreground">
                Send a detailed request to a freelancer or service provider. They can accept, decline, or counter your offer.
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/dashboard")}> 
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>

          {!isBusiness && (
            <Card className="mb-6 p-6">
              <p className="text-sm text-muted-foreground">
                Engagement requests can only be created from business accounts. Please sign in as a business to use this feature.
              </p>
            </Card>
          )}

          <Card className="p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-foreground">Target Type</Label>
                  <Select
                    value={targetType}
                    onValueChange={(value: TargetType) => handleTargetTypeChange(value)}
                    disabled={!isBusiness || saving}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-foreground">Choose Recipient</Label>
                  <Select
                    value={formData.targetId}
                    onValueChange={(value) => setFormData({ ...formData, targetId: value })}
                    disabled={!isBusiness || saving || loading || availableTargets.length === 0}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={loading ? "Loading options..." : "Select a recipient"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets.map((target) => (
                        <SelectItem key={target._id} value={target._id}>
                          {targetType === "freelancer"
                            ? target.freelancerProfile?.name || target.email
                            : target.serviceProviderProfile?.companyName || target.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {targetType === "freelancer"
                      ? "Choose a freelancer you discovered in the marketplace."
                      : "Invite a service provider to collaborate."}
                  </p>
                </div>
              </div>

              {selectedTarget && (
                <div className="rounded-lg border border-dashed p-4 bg-muted/30">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {targetType === "freelancer"
                      ? selectedTarget.freelancerProfile?.expertise || "No expertise listed"
                      : selectedTarget.serviceProviderProfile?.description || "No description provided"}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="title">Project Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Implement workflow automation for onboarding"
                  className="mt-2"
                  required
                  disabled={!isBusiness || saving}
                />
              </div>

              <div>
                <Label htmlFor="description">Scope & Goals <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project, desired outcomes, timelines, and tools"
                  className="mt-2 min-h-[150px]"
                  required
                  disabled={!isBusiness || saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget">Budget (USD) <span className="text-destructive">*</span></Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                    placeholder="5000"
                    className="mt-2"
                    min="0"
                    step="0.01"
                    required
                    disabled={!isBusiness || saving}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    disabled={!isBusiness || saving}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="terms">Terms / Notes</Label>
                <Textarea
                  id="terms"
                  value={formData.proposedTerms}
                  onChange={(e) => setFormData({ ...formData, proposedTerms: e.target.value })}
                  placeholder="Payment schedule, deliverables, milestones, etc."
                  className="mt-2 min-h-[120px]"
                  disabled={!isBusiness || saving}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={!isBusiness || saving}>
                  {saving ? "Sending..." : "Send Engagement"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                  disabled={saving}
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
