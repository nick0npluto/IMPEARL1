import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
