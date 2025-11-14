import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Login from "./pages/Login";
import BusinessProfile from "./pages/BusinessProfile";
import FreelancerProfile from "./pages/FreelancerProfile";
import Marketplace from "./pages/Marketplace";
import FreelancerDetail from "./pages/FreelancerDetail";
import CompareFreelancers from "./pages/CompareFreelancers";
import EditProfile from "./pages/EditProfile";
import PostJob from "./pages/PostJob";
import BrowseJobs from "./pages/BrowseJobs";
import CostCalculator from "./pages/CostCalculator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/business" element={<BusinessProfile />} />
          <Route path="/register/freelancer" element={<FreelancerProfile />} />
          
          {/* Marketplace Routes */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/freelancer/:id" element={<FreelancerDetail />} />
          <Route path="/compare" element={<CompareFreelancers />} />
          
          {/* Dashboard Feature Routes */}
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/jobs" element={<BrowseJobs />} />
          <Route path="/calculator" element={<CostCalculator />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;