import { Card, CardContent } from "@/components/ui/card";
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

interface PieChartComponentProps {
    title: string;
    data: any[];
    dataKey: string;
    nameKey: string;
    colors?: string[];
    height?: number;
}

const DEFAULT_COLORS = [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // orange
    "#ef4444", // red
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange-600
    "#06b6d4", // cyan
    "#84cc16", // lime
];

export default function PieChartComponent({
    title,
    data,
    dataKey,
    nameKey,
    colors = DEFAULT_COLORS,
    height = 300,
}: PieChartComponentProps) {
    return (
        <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
