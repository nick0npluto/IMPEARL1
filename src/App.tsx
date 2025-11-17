import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BusinessProfile from "./pages/BusinessProfile";
import FreelancerProfile from "./pages/FreelancerProfile";
import ServiceProviderProfile from "./pages/ServiceProviderProfile";
import Marketplace from "./pages/Marketplace";
import MyListings from "./pages/MyListings";
import Messages from "./pages/Messages";
import FreelancerDetail from "./pages/FreelancerDetail";
import CompareFreelancers from "./pages/CompareFreelancers";
import EditProfile from "./pages/EditProfile";
import PostJob from "./pages/PostJob";
import BrowseJobs from "./pages/BrowseJobs";
import Engagements from "./pages/Engagements";
import Notifications from "./pages/Notifications";
import BusinessIntake from "./pages/BusinessIntake";
import CostCalculator from "./pages/CostCalculator";
import BookmarkedFreelancers from "./pages/BookmarkedFreelancers";
import ContractDetails from "./pages/ContractDetails";
import PayoutSetup from "./pages/PayoutSetup";
import AuthGate from "@/components/AuthGate";
import GuestGate from "@/components/GuestGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
            <Route
              path="/dashboard"
              element={
                <AuthGate>
                  <Dashboard />
                </AuthGate>
              }
            />
          <Route path="/support" element={<Support />} />
            <Route
              path="/register"
              element={<GuestGate><Register /></GuestGate>}
            />
            <Route
              path="/login"
              element={<GuestGate><Login /></GuestGate>}
            />
          <Route path="/register/business" element={<GuestGate><BusinessProfile /></GuestGate>} />
          <Route path="/register/freelancer" element={<GuestGate><FreelancerProfile /></GuestGate>} />
          <Route path="/register/service-provider" element={<GuestGate><ServiceProviderProfile /></GuestGate>} />
          {/* Marketplace Routes */}
          <Route path="/marketplace" element={<AuthGate><Marketplace /></AuthGate>} />
          <Route path="/listings" element={<AuthGate><MyListings /></AuthGate>} />
          <Route path="/messages" element={<AuthGate><Messages /></AuthGate>} />
          <Route path="/freelancer/:id" element={<AuthGate><FreelancerDetail /></AuthGate>} />
          <Route path="/compare" element={<AuthGate><CompareFreelancers /></AuthGate>} />
          <Route path="/bookmarks" element={<AuthGate><BookmarkedFreelancers /></AuthGate>} />
          <Route path="/bookmarks" element={<BookmarkedFreelancers />} />
          
          {/* Dashboard Feature Routes */}
          <Route path="/profile" element={<AuthGate><EditProfile /></AuthGate>} />
          <Route path="/post-job" element={<AuthGate><PostJob /></AuthGate>} />
          <Route path="/jobs" element={<AuthGate><BrowseJobs /></AuthGate>} />
          <Route path="/engagements" element={<AuthGate><Engagements /></AuthGate>} />
          <Route path="/contracts/:id" element={<AuthGate><ContractDetails /></AuthGate>} />
          <Route path="/notifications" element={<AuthGate><Notifications /></AuthGate>} />
          <Route path="/qna" element={<AuthGate><BusinessIntake /></AuthGate>} />
          <Route path="/calculator" element={<AuthGate><CostCalculator /></AuthGate>} />
          <Route path="/payout-setup" element={<AuthGate><PayoutSetup /></AuthGate>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
