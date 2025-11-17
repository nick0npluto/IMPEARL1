import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ChatInterface from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";
import {
  User,
  Brain,
  ShoppingCart,
  Store,
  PlusCircle,
  Calculator,
  Users,
  CreditCard,
  Bookmark,
  MessageSquare,
  TrendingUp,
  HelpCircle,
  Bell,
  Loader2,
  ListChecks,
} from "lucide-react";

interface Engagement {
  _id: string;
  title: string;
  status: string;
  targetType: string;
  targetFreelancer?: { name?: string };
  targetProvider?: { companyName?: string };
  updatedAt?: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt?: string;
}

interface ContractItem {
  _id: string;
  status: string;
}

interface MatchFreelancer {
  id: string;
  name: string;
  expertise?: string;
  yearsExperience?: string;
  hourlyRate?: number;
  availability?: string;
  score: number;
}

interface MatchProvider {
  id: string;
  companyName: string;
  industryFocus?: string[];
  description?: string;
  score: number;
}

const ClientDashboard = () => {
  const { toast } = useToast();
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [intakeSession, setIntakeSession] = useState<any>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [recommendations, setRecommendations] = useState<{ freelancers?: MatchFreelancer[]; providers?: MatchProvider[] }>({});
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        const [intakeRes, engagementRes, notificationRes, contractRes, recoFreelancers, recoProviders, profileRes] = await Promise.all([
          ApiService.getLatestQnaSession().catch(() => null),
          ApiService.getEngagements().catch(() => ({ engagements: [] })),
          ApiService.getNotifications().catch(() => ({ notifications: [] })),
          ApiService.getContracts().catch(() => ({ contracts: [] })),
          ApiService.getRecommendedFreelancers().catch(() => ({ recommendations: [] })),
          ApiService.getRecommendedProviders().catch(() => ({ recommendations: [] })),
          ApiService.getProfile().catch(() => null),
        ]);

        setIntakeSession(intakeRes?.session || null);
        setEngagements(engagementRes?.engagements || []);
        setNotifications(notificationRes?.notifications || []);
        setContracts(contractRes?.contracts || []);
        setRecommendations({
          freelancers: recoFreelancers?.recommendations || [],
          providers: recoProviders?.recommendations || [],
        });
        setProfile(profileRes?.user || null);
      } catch (error: any) {
        toast({
          title: "Unable to load dashboard data",
          description: error.message || "Please try again shortly.",
          variant: "destructive",
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [toast]);

  const pendingEngagements = useMemo(
    () => engagements.filter((eng) => eng.status === "pending").length,
    [engagements]
  );
  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active").length,
    [contracts]
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const intakeLastUpdated = intakeSession?.updatedAt || intakeSession?.createdAt;

  const quickInsights = useMemo(() => {
    const answers = intakeSession?.answers;
    if (!answers) {
      return [];
    }
    const notes: string[] = [];
    if (answers.goals) {
      notes.push(`Prioritize the goal "${answers.goals.split(/[\n,]/)[0]}" in your next sprint.`);
    }
    if (answers.painPoints) {
      notes.push(`Automations that target "${answers.painPoints.split(/[\n,]/)[0]}" can unlock quick wins.`);
    }
    if (answers.timeline) {
      notes.push(`Plan milestones that respect the ${answers.timeline} timeline.`);
    }
    return notes.slice(0, 3);
  }, [intakeSession]);

  const dashboardItems = [
    {
      icon: User,
      title: "My Profile",
      description: "Manage your business profile and preferences",
      link: "/profile",
    },
    {
      icon: Brain,
      title: "AI Recommendations",
      description: "Get personalized automation and tool suggestions",
      link: "/qna",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Browse and hire freelancers for your projects",
      link: "/marketplace",
    },
    {
      icon: PlusCircle,
      title: "Send Engagement",
      description: "Invite freelancers or providers with one click",
      link: "/post-job",
    },
    {
      icon: Calculator,
      title: "Cost Calculator",
      description: "Calculate ROI and project costs",
      link: "/calculator",
    },
    {
      icon: Users,
      title: "Hired Freelancers",
      description: "Manage your active contracts and team",
      link: "/hired",
    },
    {
      icon: CreditCard,
      title: "Pay Center",
      description: "Process payments and manage invoices",
      link: "/payments",
    },
    {
      icon: Bookmark,
      title: "Bookmarked Freelancers",
      description: "Your saved freelancers for future projects",
      link: "/bookmarks",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Communicate with freelancers",
      link: "/messages",
    },
    {
      icon: HelpCircle,
      title: "Support",
      description: "Get help from our team",
      link: "/support",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Track automation performance and ROI",
      link: "/analytics",
    },
  ];

  const formatDate = (value?: string) => {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(new Date(value));
    } catch (err) {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Business Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover automation solutions, hire experts, and transform your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 animate-slide-up">
            {[
              {
                title: "Automation Intake",
                value: intakeSession ? "Completed" : "Not started",
                description: intakeSession
                  ? `Updated ${intakeLastUpdated ? formatDate(intakeLastUpdated) : "recently"}`
                  : "Finish the questionnaire to unlock AI insights",
                action: intakeSession ? "View" : "Start",
                href: "/qna",
              },
              {
                title: "Pending Engagements",
                value: pendingEngagements.toString(),
                description: "Requests awaiting your response",
                action: "Review",
                href: "/engagements",
              },
              {
                title: "Active Contracts",
                value: activeContracts.toString(),
                description: "In-flight automation work",
                action: "Manage",
                href: "/engagements",
              },
              {
                title: "Unread Alerts",
                value: unreadNotifications.toString(),
                description: "Notifications needing attention",
                action: "Open",
                href: "/notifications",
              },
            ].map((card, idx) => (
              <Card key={card.title} className="p-6 flex flex-col justify-between shadow-card">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{loadingSummary ? "--" : card.value}</p>
                  <p className="text-sm text-muted-foreground mt-1 min-h-[32px]">
                    {loadingSummary ? "Loading..." : card.description}
                  </p>
                </div>
                <Button asChild variant="secondary" size="sm" className="mt-4 w-fit">
                  <Link to={card.href}>{card.action}</Link>
                </Button>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ListChecks className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Recent Engagements</h3>
              </div>
              {loadingSummary ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading engagements...
                </div>
              ) : engagements.length === 0 ? (
                <p className="text-muted-foreground">No engagements yet. Hire from the marketplace to get started.</p>
              ) : (
                <div className="space-y-4">
                  {engagements.slice(0, 4).map((engagement) => (
                    <div key={engagement._id} className="flex items-start justify-between border-b border-border/60 pb-3">
                      <div>
                        <p className="font-semibold text-foreground">{engagement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {engagement.targetType === "freelancer"
                            ? engagement.targetFreelancer?.name || "Freelancer"
                            : engagement.targetProvider?.companyName || "Service Provider"}
                        </p>
                        <p className="text-xs text-muted-foreground">Updated {formatDate(engagement.updatedAt)}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {engagement.status}
                      </Badge>
                    </div>
                  ))}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/engagements">View all engagements</Link>
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Latest Alerts</h3>
              </div>
              {loadingSummary ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground">No notifications yet.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 4).map((notification) => (
                    <div key={notification._id} className="border-b border-border/60 pb-3">
                      <p className="font-semibold text-foreground">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                    </div>
                  ))}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/notifications">Go to notifications</Link>
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {quickInsights.length > 0 && (
            <Card className="p-6 mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">AI Intake Highlights</h3>
              </div>
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                {quickInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </Card>
          )}

          {(recommendations.freelancers?.length || recommendations.providers?.length) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {recommendations.freelancers?.length ? (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Top Freelance Matches</h3>
                  </div>
                  <div className="space-y-4">
                    {recommendations.freelancers.map((freelancer) => (
                      <div key={freelancer.id} className="border-b border-border/60 pb-3">
                        <p className="font-semibold text-foreground">{freelancer.name}</p>
                    <p className="text-sm text-muted-foreground">{freelancer.expertise || 'Automation expert'}</p>
                    <p className="text-xs text-muted-foreground">
                      Experience: {freelancer.yearsExperience || 'n/a'} | Rate: {freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : 'Custom'}
                    </p>
                    {freelancer.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{freelancer.reason}</p>
                    )}
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link to={`/freelancer/${freelancer.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}

              {recommendations.providers?.length ? (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Store className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Top Service Providers</h3>
                  </div>
                  <div className="space-y-4">
                    {recommendations.providers.map((provider) => (
                      <div key={provider.id} className="border-b border-border/60 pb-3">
                        <p className="font-semibold text-foreground">{provider.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(provider.industryFocus || []).slice(0, 2).join(', ') || 'Cross-industry'}
                    </p>
                    <p className="text-xs text-muted-foreground">Score: {provider.score.toFixed(1)}</p>
                    {provider.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{provider.reason}</p>
                    )}
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link to="/marketplace">View Offering</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slide-up">
            {dashboardItems.map((item, index) => (
              <DashboardCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
                link={item.link}
              />
            ))}
          </div>

          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Chat with IMPEARL AI
            </h2>
            <ChatInterface
              context={{
                extras: `Business: ${profile?.businessProfile?.businessName || ''}. Industry: ${profile?.businessProfile?.industry || ''}. Goals: ${profile?.businessProfile?.goals || ''}. Pending engagements: ${pendingEngagements}. Active contracts: ${activeContracts}. Recommended talent: ${(recommendations.freelancers || []).map((f) => f.name).join(', ')}. Recommended providers: ${(recommendations.providers || []).map((p) => p.companyName).join(', ')}`,
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientDashboard;
