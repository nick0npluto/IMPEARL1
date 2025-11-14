import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FreelancerDashboard from "./FreelancerDashboard";
import ClientDashboard from "./ClientDashboard";
import ApiService from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and get their type
    const checkAuth = async () => {
      try {
        const token = ApiService.getToken();
        
        if (!token) {
          // No token, redirect to login
          navigate('/login');
          return;
        }

        // Verify token and get user info
        const response = await ApiService.verifyToken();
        
        if (response.user && response.user.userType) {
          setUserType(response.user.userType);
        } else {
          // Invalid token or user type, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token verification failed, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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
  if (userType === 'freelancer') {
    return <FreelancerDashboard />;
  } else if (userType === 'business') {
    return <ClientDashboard />;
  }

  // Fallback (shouldn't reach here due to navigation in useEffect)
  return null;
};

export default Dashboard;