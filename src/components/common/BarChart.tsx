import { Card, CardContent } from "@/components/ui/card";
import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface BarChartProps {
    title: string;
    data: any[];
    dataKey: string;
    xKey: string;
    color?: string;
    height?: number;
}

export default function BarChart({
    title,
    data,
    dataKey,
    xKey,
    color = "#8b5cf6",
    height = 300,
}: BarChartProps) {
    return (
        <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsBarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey={xKey} stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                            }}
                        />
                        <Legend />
                        <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
