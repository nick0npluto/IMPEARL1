import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ChatInterface from "@/components/ChatInterface";
import {
  User,
  Brain,
  ShoppingCart,
  CreditCard,
  Bookmark,
  Calculator,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const dashboardItems = [
    {
      icon: User,
      title: "My Profile",
      description: "Manage your business or freelancer profile",
      link: "/dashboard",
    },
    {
      icon: Brain,
      title: "AI Recommendations",
      description: "View personalized tool and automation suggestions",
      link: "/dashboard",
    },
    {
      icon: ShoppingCart,
      title: "Marketplace",
      description: "Browse and compare automation tools",
      link: "/features",
    },
    {
      icon: CreditCard,
      title: "Pay Center",
      description: "Manage payments and transactions",
      link: "/dashboard",
    },
    {
      icon: Bookmark,
      title: "Bookmarked Tools",
      description: "Your saved automation solutions",
      link: "/dashboard",
    },
    {
      icon: Calculator,
      title: "Cost Calculator",
      description: "Calculate ROI for your automation plans",
      link: "/dashboard",
    },
    {
      icon: MessageSquare,
      title: "Support",
      description: "Get help from our team and community",
      link: "/support",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Track your automation performance",
      link: "/dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your automation journey from one central hub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
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

export default Dashboard;
