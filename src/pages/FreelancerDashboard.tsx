import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ChatInterface from "@/components/ChatInterface";
import {
  User,
  Briefcase,
  FileText,
  FolderOpen,
  DollarSign,
  Star,
  MessageSquare,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

const FreelancerDashboard = () => {
  const dashboardItems = [
    {
      icon: User,
      title: "My Profile",
      description: "Manage your freelancer profile and portfolio",
      link: "/profile",
    },
    {
      icon: Briefcase,
      title: "Browse Jobs",
      description: "Find new project opportunities",
      link: "/jobs",
    },
    {
      icon: FileText,
      title: "My Proposals",
      description: "Track your submitted proposals",
      link: "/proposals",
    },
    {
      icon: FolderOpen,
      title: "Active Projects",
      description: "View and manage your current projects",
      link: "/projects",
    },
    {
      icon: DollarSign,
      title: "Earnings",
      description: "View your payment history and earnings",
      link: "/earnings",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "See your client reviews and ratings",
      link: "/reviews",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Chat with clients and get updates",
      link: "/messages",
    },
    {
      icon: HelpCircle,
      title: "Support",
      description: "Get help and access resources",
      link: "/support",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Track your performance and growth",
      link: "/analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Freelancer Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your projects, find new opportunities, and grow your freelance business
            </p>
          </div>

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
            <ChatInterface />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FreelancerDashboard;
