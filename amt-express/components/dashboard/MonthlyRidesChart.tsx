'use client'

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

type MonthlyData = {
    month: string;
    rides: number;
};

type Props = {
    data: MonthlyData[];
};

export function MonthlyRidesChart({data}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Rides</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rides" fill="#3b82f6" name="Rides" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
