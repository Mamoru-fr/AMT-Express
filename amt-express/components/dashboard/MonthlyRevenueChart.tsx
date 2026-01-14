'use client'

/**
 * Monthly Revenue Line Chart
 * Displays revenue trends over the last 12 months
 * Only includes revenue from completed rides
 */

import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

type MonthlyRevenue = {
    month: string;
    revenue: number;
};

type Props = {
    data: MonthlyRevenue[];
};

export function MonthlyRevenueChart({data}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
            {/* 
                ResponsiveContainer: Makes the chart responsive to its parent container
                - width="100%": Chart fills the full width of parent
                - height={300}: Fixed height of 300px
                This component handles resize events automatically
            */}
            <ResponsiveContainer width="100%" height={300}>
                {/* 
                    LineChart: Main chart component for line/area charts
                    - data prop: Array of objects to visualize (each object = one point on the chart)
                    - Automatically maps data array to x-axis points
                */}
                <LineChart data={data}>
                    {/* 
                        CartesianGrid: Adds background grid lines to the chart
                        - strokeDasharray="3 3": Creates dashed lines (3px dash, 3px gap)
                        - Makes it easier to read values by providing reference lines
                    */}
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    {/* 
                        XAxis: Horizontal axis configuration
                        - dataKey="month": Which field from data objects to use for x-axis labels
                        - Displays the "month" value from each data point (e.g., "Jan 2026")
                    */}
                    <XAxis dataKey="month" />
                    
                    {/* 
                        YAxis: Vertical axis configuration
                        - No dataKey needed (uses the Line's dataKey automatically)
                        - Automatically scales based on min/max values in the data
                    */}
                    <YAxis />
                    
                    {/* 
                        Tooltip: Popup that appears when hovering over data points
                        - formatter: Custom function to format the displayed value
                        - Here we format numbers as currency with € symbol and 2 decimals
                    */}
                    <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
                    
                    {/* 
                        Legend: Shows labels for each line (useful when multiple lines exist)
                        - Automatically positioned at the bottom of the chart
                        - Uses the "name" prop from Line components
                    */}
                    <Legend />
                    
                    {/* 
                        Line: Defines the actual line to be drawn on the chart
                        - type="monotone": Smooth curve interpolation between points
                        - dataKey="revenue": Which field from data objects to use for y-values
                        - stroke: Line color (green #10b981 in this case)
                        - strokeWidth: Thickness of the line in pixels
                        - name: Label shown in legend and tooltip
                        
                        The chart will plot points using:
                        - X position: data[i].month
                        - Y position: data[i].revenue
                    */}
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (€)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
