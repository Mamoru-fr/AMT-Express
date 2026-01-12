'use client'

import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';

type StatusData = {
    name: string;
    value: number;
};

type Props = {
    data: StatusData[];
};

const COLORS = {
    'Completed': '#10b981',
    'In Progress': '#3b82f6',
    'Pending': '#f59e0b',
    'Cancelled': '#ef4444'
};

export function StatusPieChart({data}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Rides by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
