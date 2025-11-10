import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              IMPEARL
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/features" className="text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/support" className="text-foreground hover:text-primary transition-colors">
              Support
            </Link>
            <Button variant="default" size="sm">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              to="/"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/features"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/dashboard"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/support"
              className="block text-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            <Button variant="default" size="sm" className="w-full">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
