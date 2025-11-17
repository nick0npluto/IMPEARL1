import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import { Brain } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const defaultForm = {
  businessName: "",
  currentTools: "",
  goals: "",
  painPoints: "",
  budget: "",
  timeline: "",
  preferences: "",
  notes: "",
};

const BusinessIntake = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const response = await ApiService.getLatestQnaSession();
        if (response.session) {
          setSessionId(response.session._id);
          setFormData({ ...defaultForm, ...(response.session.answers || {}) });
          setLastUpdated(response.session.updatedAt || response.session.createdAt);
          setRecommendations(buildRecommendations(response.session.answers || defaultForm));
        }
      } catch (error) {
        // no previous session
      } finally {
        setLoading(false);
      }
    };

    loadLatest();
  }, []);

  const handleChange = (field: keyof typeof defaultForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const derivedTags = buildDerivedTags(formData);

    try {
      if (sessionId) {
        await ApiService.updateQnaSession(sessionId, { answers: formData, derivedTags });
        toast({ title: "Updated", description: "Your requirements have been updated." });
      } else {
        const response = await ApiService.startQnaSession({ ...formData, derivedTags });
        setSessionId(response.session?._id || response.session?.id || null);
        toast({ title: "Submitted", description: "Thanks! We'll generate tailored recommendations." });
      }
      setLastUpdated(new Date().toISOString());
      setRecommendations(buildRecommendations(formData));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Unable to submit", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const buildDerivedTags = (answers: typeof defaultForm) => {
    const tags = new Set<string>();
    const collect = (text?: string) => {
      text?.split(/[,\n]/).forEach((item) => {
        if (item && item.trim()) tags.add(item.trim().toLowerCase());
      });
    };
    collect(answers.goals);
    collect(answers.painPoints);
    collect(answers.currentTools);
    return Array.from(tags).slice(0, 10);
  };

  const buildRecommendations = (answers: typeof defaultForm) => {
    const recs: string[] = [];
    if (answers.goals) {
      recs.push(`Focus on the goal "${answers.goals.split(/[,\n]/)[0]}" to anchor your roadmap.`);
    }
    if (answers.painPoints) {
      recs.push(`Target automation that tackles "${answers.painPoints.split(/[,\n]/)[0]}" first for quick ROI.`);
    }
    if (answers.currentTools) {
      recs.push(`Integrate new solutions with ${answers.currentTools.split(/[,\n]/).slice(0, 2).join(', ')} instead of replacing them immediately.`);
    }
    if (answers.timeline) {
      recs.push(`Break work into milestones that fit the ${answers.timeline} timeline.`);
    }
    if (answers.preferences) {
      recs.push(`Respect preferences like "${answers.preferences.split(/[,\n]/)[0]}" when evaluating vendors.`);
    }
    if (!recs.length) {
      recs.push('Share more goals or pain points above to see tailored insights.');
    }
    return recs;
  };

  const derivedTags = useMemo(() => buildDerivedTags(formData), [formData]);

  if (!user || user.userType !== 'business') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <p className="text-muted-foreground">Only business accounts can complete the automation intake.</p>
          </Card>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your saved answers...</p>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="flex items-start gap-4">
            <Brain className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">Automation Intake</h1>
              <p className="text-muted-foreground">
                Tell us about your business and automation goals. We'll use this to power AI recommendations.
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-2">Last saved {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>

          <Card className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="Acme Automation Co."
                />
              </div>

              <div>
                <Label htmlFor="currentTools">Current Tools & Systems</Label>
                <Textarea
                  id="currentTools"
                  value={formData.currentTools}
                  onChange={(e) => handleChange("currentTools", e.target.value)}
                  placeholder="CRMs, support platforms, custom tools, spreadsheets, etc."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="goals">Goals & Desired Outcomes</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleChange("goals", e.target.value)}
                  placeholder="Automate onboarding, reduce manual data entry, improve analytics..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="painPoints">Pain Points</Label>
                <Textarea
                  id="painPoints"
                  value={formData.painPoints}
                  onChange={(e) => handleChange("painPoints", e.target.value)}
                  placeholder="Where are the bottlenecks today?"
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    placeholder="$5k - $10k"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => handleChange("timeline", e.target.value)}
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="preferences">Preferences</Label>
                <Textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => handleChange("preferences", e.target.value)}
                  placeholder="No-code tools, preferred vendors, security requirements, etc."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Anything else we should know?"
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : sessionId ? "Update" : "Submit"}
                </Button>
                {sessionId && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setSessionId(null);
                      setFormData(defaultForm);
                      setRecommendations([]);
                      setLastUpdated(null);
                    }}
                  >
                    Start New Session
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI Insights</h2>
                <p className="text-muted-foreground text-sm">Quick guidance generated from your answers.</p>
              </div>
              {derivedTags.length > 0 && (
                <div className="text-right text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Focus Areas</p>
                  <p>{derivedTags.slice(0, 4).join(', ')}</p>
                </div>
              )}
            </div>
            {recommendations.length === 0 ? (
              <p className="text-muted-foreground text-sm">Share more information above to see recommendations.</p>
            ) : (
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground">
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
};

export default BusinessIntake;
