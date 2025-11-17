import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: ReactNode;
}

const GuestGate = ({ children }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const onboardingRoute = user?.userType === "freelancer"
    ? "/register/freelancer"
    : user?.userType === "business"
      ? "/register/business"
      : user?.userType === "service_provider"
        ? "/register/service-provider"
        : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.hasProfile) {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.hasProfile === false && onboardingRoute && location.pathname !== onboardingRoute) {
      return <Navigate to={onboardingRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default GuestGate;
