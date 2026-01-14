'use client'

/**
 * Monthly Rides Bar Chart
 * Shows the total number of rides per month for the last 12 months
 * Includes all rides regardless of status
 */

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
            {/* 
                ResponsiveContainer: Wrapper that makes the chart adapt to container size
                - Listens to window resize events and updates chart dimensions
                - Essential for responsive layouts
            */}
            <ResponsiveContainer width="100%" height={300}>
                {/* 
                    BarChart: Main component for creating bar/column charts
                    - data: Array of objects where each object represents one bar
                    - Renders vertical bars by default
                    
                    Example data structure:
                    [{month: "Jan 2026", rides: 45}, {month: "Feb 2026", rides: 52}, ...]
                */}
                <BarChart data={data}>
                    {/* 
                        CartesianGrid: Background grid for easier value reading
                        - strokeDasharray: Pattern for dashed lines (dash length, gap length)
                    */}
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    {/* 
                        XAxis: Bottom axis showing month labels
                        - dataKey="month": Uses the "month" property from each data object
                        - One label per bar
                    */}
                    <XAxis dataKey="month" />
                    
                    {/* 
                        YAxis: Left axis showing the numeric scale
                        - Automatically calculates range based on data values
                        - Auto-generates tick marks and labels
                    */}
                    <YAxis />
                    
                    {/* 
                        Tooltip: Interactive popup on hover
                        - Shows the exact values when you hover over a bar
                        - Default formatter shows value as-is
                    */}
                    <Tooltip />
                    
                    {/* 
                        Legend: Key explaining what each bar represents
                        - Useful when you have multiple Bar components (grouped/stacked bars)
                    */}
                    <Legend />
                    
                    {/* 
                        Bar: Defines the bars to render
                        - dataKey="rides": Uses the "rides" property for bar height
                        - fill: Color of the bars (#3b82f6 = blue)
                        - name: Label displayed in legend and tooltip
                        
                        Each bar's height is determined by data[i].rides value
                    */}
                    <Bar dataKey="rides" fill="#3b82f6" name="Rides" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
