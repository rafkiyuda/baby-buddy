"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data for MVP Visualization
// In real app, we fetch this from API/Server Action based on Profile ID
const data = [
    { month: 0, weight: 3.5, who_medi: 3.5 },
    { month: 1, weight: 4.5, who_medi: 4.5 },
    { month: 2, weight: 5.6, who_medi: 5.6 },
    { month: 3, weight: 6.4, who_medi: 6.4 },
    { month: 4, weight: 7.0, who_medi: 7.0 },
    { month: 5, weight: 7.5, who_medi: 7.5 }, // User mock
];

// WHO simplified background regions (mock for visualization)
const domain = [0, 6];

export function GrowthChart() {
    return (
        <Card className="glass h-[400px]">
            <CardHeader>
                <CardTitle>Weight for Age</CardTitle>
                <CardDescription>Comparing your child's growth against WHO Standards.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" label={{ value: 'Age (Months)', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none' }}
                            labelStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend />
                        {/* WHO Median Line */}
                        <Line type="monotone" dataKey="who_medi" stroke="var(--secondary)" strokeDasharray="5 5" name="WHO Median" dot={false} />
                        {/* Child's Growth Line */}
                        <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} name="Your Child" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
