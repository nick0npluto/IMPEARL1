import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
}

const DashboardCard = ({ icon: Icon, title, description, link }: DashboardCardProps) => {
  return (
    <Link
      to={link}
      className="bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-card rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1 text-card-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;
