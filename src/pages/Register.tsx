import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { Building2, User, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'choose' | 'credentials'>('choose');
  const [selectedRole, setSelectedRole] = useState<"business" | "freelancer" | "service_provider" | null>(null);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleRoleSelection = (role: 'business' | 'freelancer' | 'service_provider') => {
    setSelectedRole(role);
    setStep('credentials');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password || !credentials.confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (credentials.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await ApiService.register(
        credentials.email,
        credentials.password,
        selectedRole as 'business' | 'freelancer' | 'service_provider'
      );

      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });

      // Redirect to profile creation
      if (selectedRole === 'freelancer') {
        navigate('/register/freelancer');
      } else if (selectedRole === 'business') {
        navigate('/register/business');
      } else {
        navigate('/register/service-provider');
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'credentials' && selectedRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-md">
            <div className="mb-8 text-center animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Create Your Account
              </h1>
              <p className="text-xl text-muted-foreground">
                {selectedRole === 'freelancer'
                  ? 'Freelancer'
                  : selectedRole === 'business'
                    ? 'Business'
                    : 'Service Provider'} Account
              </p>
            </div>

            <Card className="p-8 animate-slide-up">
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    placeholder="Enter your email"
                    className="mt-2"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                    className="mt-2"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={credentials.confirmPassword}
                    onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="mt-2"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('choose')}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Log in
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Join IMPEARL
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your account type to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
            <Card 
              className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
              onClick={() => handleRoleSelection("business")}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Business</h3>
                <p className="text-muted-foreground mb-6">
                  Find automation tools, hire freelancers, and grow your business with AI-powered recommendations
                </p>
                <Button variant="default" size="lg" className="w-full">
                  Continue as Business
                </Button>
              </div>
            </Card>

            <Card 
              className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
              onClick={() => handleRoleSelection("freelancer")}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Freelancer</h3>
                <p className="text-muted-foreground mb-6">
                  Showcase your expertise, connect with businesses, and get hired for automation projects
                </p>
                <Button variant="default" size="lg" className="w-full">
                  Continue as Freelancer
                </Button>
              </div>
            </Card>

            <Card 
              className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
              onClick={() => handleRoleSelection("service_provider")}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">Service Provider</h3>
                <p className="text-muted-foreground mb-6">
                  Publish SaaS tools or packaged services and get matched with IMPEARL businesses ready to buy
                </p>
                <Button variant="default" size="lg" className="w-full">
                  Continue as Provider
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
