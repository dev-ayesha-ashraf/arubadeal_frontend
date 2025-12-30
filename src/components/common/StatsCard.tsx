import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: "blue" | "green" | "orange" | "purple" | "default";
    action?: ReactNode;
    description?: string;
    className?: string;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    variant = "default",
    action,
    description,
    className,
}: StatsCardProps) {
    const variants = {
        default: {
            card: "bg-white border-gray-200",
            text: "text-gray-600",
            value: "text-gray-900",
            icon: "text-gray-600",
        },
        blue: {
            card: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
            text: "text-blue-600",
            value: "text-blue-900",
            icon: "text-blue-600",
        },
        green: {
            card: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
            text: "text-green-600",
            value: "text-green-900",
            icon: "text-green-600",
        },
        orange: {
            card: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
            text: "text-orange-600",
            value: "text-orange-900",
            icon: "text-orange-600",
        },
        purple: {
            card: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
            text: "text-purple-600",
            value: "text-purple-900",
            icon: "text-purple-600",
        },
    };

    const styles = variants[variant];

    return (
        <Card className={`${styles.card} ${className || ""}`}>
            <CardContent className="p-6">
                <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className={`text-sm font-medium ${styles.text}`}>{title}</p>
                            <p className={`text-2xl font-bold ${styles.value}`}>{value}</p>
                            {description && (
                                <p className={`text-xs mt-1 opacity-80 ${styles.text}`}>
                                    {description}
                                </p>
                            )}
                        </div>
                        <Icon className={`w-8 h-8 ${styles.icon}`} />
                    </div>
                    {action && <div className="mt-auto pt-2">{action}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
