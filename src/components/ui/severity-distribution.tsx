"use client";

import { CSSProperties } from "react";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";


export type SeverityDistributionItem = {
    severity: "critical" | "high" | "medium" | "low";
    count: number;
};

interface SeverityDistributionProps {
    data: SeverityDistributionItem[];
    title?: string;
}



export function SeverityDistribution({
    data,
    title = "Severity Distribution",
}: SeverityDistributionProps) {
    const colors: Record<SeverityDistributionItem["severity"], string> = {
        low: "#10b981",
        medium: "#f59e0b",
        high: "#f97316",
        critical: "#ef4444",
    };

    const labels: Record<SeverityDistributionItem["severity"], string> = {
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical",
    };

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="w-full">
            <h3 className="font-display font-semibold mb-4">
                {title}
            </h3>

            {total === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-sm text-muted">
                    No reports yet
                </div>
            ) : (
                <div className="grid grid-cols-[1fr_auto] items-center gap-6">
                    <div className="h-[230px] min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip />
                                <Pie
                                    data={data}
                                    dataKey="count"
                                    nameKey="severity"
                                    innerRadius={58}
                                    outerRadius={92}
                                    paddingAngle={2}
                                    stroke="transparent"
                                >
                                    {data.map((entry) => (
                                        <Cell
                                            key={entry.severity}
                                            fill={colors[entry.severity]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4 min-w-[120px]">
                        {data.map((item) => (
                            <div
                                key={item.severity}
                                className="flex items-center gap-3"
                            >
                                <span
                                    className="h-3.5 w-3.5 rounded-sm shrink-0"
                                    style={{
                                        backgroundColor: colors[item.severity],
                                    }}
                                />

                                <span className="text-muted text-sm">
                                    {labels[item.severity]}
                                </span>

                                <span className="ml-auto font-semibold tabular-nums">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeverityDistribution;