import FreelancerDashboard from "./FreelancerDashboard";
import ClientDashboard from "./ClientDashboard";
import ServiceProviderDashboard from "./ServiceProviderDashboard";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, refresh, loading } = useAuth();

  useEffect(() => {
    if (!user) {
      refresh();
    }
  }, [user, refresh]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user type
  if (user?.userType === 'freelancer') {
    return <FreelancerDashboard />;
  } else if (user?.userType === 'business') {
    return <ClientDashboard />;
  } else if (user?.userType === 'service_provider') {
    return <ServiceProviderDashboard />;
  }

  // Fallback (shouldn't reach here due to navigation in useEffect)
  return null;
};

export default Dashboard;
