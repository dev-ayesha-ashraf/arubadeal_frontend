import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string; // e.g., "text-blue-600", "text-white"
  iconBgColor?: string; // e.g., "bg-blue-100", "bg-dealership-primary"
  children?: React.ReactNode; // For action buttons on the right
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-white",
  iconBgColor = "bg-dealership-primary",
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          {Icon && (
            <div className={`p-3 ${iconBgColor} rounded-xl shadow-sm`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 mt-2 ml-1 text-lg">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}