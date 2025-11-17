import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ChatInterface from "@/components/ChatInterface";
import {
  Building2,
  Rocket,
  Store,
  Briefcase,
  MessageSquare,
  Users,
  ClipboardList,
  DollarSign,
  HelpCircle,
} from "lucide-react";

const ServiceProviderDashboard = () => {
  const dashboardItems = [
    {
      icon: Building2,
      title: "Company Profile",
      description: "Update your service provider profile",
      link: "/profile",
    },
    {
      icon: Rocket,
      title: "Publish Offering",
      description: "List SaaS tools or service packages in the marketplace",
      link: "/marketplace",
    },
    {
      icon: ClipboardList,
      title: "Engagement Requests",
      description: "Review new proposals from businesses",
      link: "/engagements",
    },
    {
      icon: Briefcase,
      title: "Active Contracts",
      description: "Manage ongoing engagements and deliverables",
      link: "/contracts",
    },
    {
      icon: DollarSign,
      title: "Payments",
      description: "Track payments and payouts",
      link: "/payments",
    },
    {
      icon: Users,
      title: "Customer Reviews",
      description: "See ratings and feedback from businesses",
      link: "/reviews",
    },
    {
      icon: Store,
      title: "Marketplace Listing",
      description: "Preview how buyers see your offerings",
      link: "/marketplace",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      description: "Chat with clients on active contracts",
      link: "/messages",
    },
    {
      icon: HelpCircle,
      title: "Support",
      description: "Reach out to IMPEARL support",
      link: "/support",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Service Provider Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your offerings, respond to opportunities, and grow with IMPEARL businesses
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

export default ServiceProviderDashboard;
