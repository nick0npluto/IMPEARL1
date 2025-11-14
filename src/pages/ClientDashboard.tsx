import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ChatInterface from "@/components/ChatInterface";
import {
  User,
  Brain,
  ShoppingCart,
  PlusCircle,
  Calculator,
  Users,
  CreditCard,
  Bookmark,
  MessageSquare,
  TrendingUp,
  HelpCircle,
} from "lucide-react";

const ClientDashboard = () => {
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
      link: "/recommendations",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Browse and hire freelancers for your projects",
      link: "/marketplace",
    },
    {
      icon: PlusCircle,
      title: "Post a Job",
      description: "Create and publish new job opportunities",
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
      title: "Bookmarked Tools",
      description: "Your saved automation solutions",
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

export default ClientDashboard;
