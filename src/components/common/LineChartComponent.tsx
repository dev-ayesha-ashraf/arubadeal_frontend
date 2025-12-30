import { Card, CardContent } from "@/components/ui/card";
import {
    ResponsiveContainer,
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

interface LineChartComponentProps {
    title: string;
    data: any[];
    lines: {
        dataKey: string;
        color: string;
        name: string;
    }[];
    xKey: string;
    height?: number;
}

export default function LineChartComponent({
    title,
    data,
    lines,
    xKey,
    height = 300,
}: LineChartComponentProps) {
    return (
        <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsLineChart data={data}>
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
                        {lines.map((line, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                name={line.name}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
