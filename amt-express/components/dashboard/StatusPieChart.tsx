'use client'

/**
 * Status Distribution Pie Chart
 * Visualizes the breakdown of rides by their status (Completed, In Progress, Pending, Cancelled)
 * Uses Recharts library for rendering
 */

import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';

type StatusData = {
    name: string;
    value: number;
};

type Props = {
    data: StatusData[];  // Array of {name: string, value: number} for each status
};

// Color mapping for each ride status
// These colors are used to color the pie chart segments
const COLORS = {
    'Completed': '#10b981',
    'In Progress': '#3b82f6',
    'Pending': '#f59e0b',
    'Cancelled': '#ef4444'
};

export function StatusPieChart({data}: Props) {
    return (
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Rides by Status</h3>
            {/* ResponsiveContainer: Makes pie chart resize with its parent container */}
            <ResponsiveContainer width="100%" height={300}>
                {/* 
                    PieChart: Container component for pie/donut charts
                    - Unlike BarChart/LineChart, it doesn't need a data prop at this level
                    - Data is passed to the Pie component instead
                */}
                <PieChart>
                    {/* 
                        Pie: The actual pie chart component
                        This is where all the main configuration happens
                    */}
                    <Pie
                        /* data: Array of objects to visualize as pie slices
                           Each object becomes one slice of the pie */
                        data={data}
                        
                        /* cx, cy: Center position of the pie
                           "50%" means center horizontally and vertically
                           Can also use pixel values like cx={150} */
                        cx="50%"
                        cy="50%"
                        
                        /* labelLine: Whether to show lines connecting labels to slices
                           false = labels appear directly on/near slices without connector lines */
                        labelLine={false}
                        
                        /* label: Custom label rendering function
                           Gets called for each slice with slice data
                           - name: The "name" field from data object
                           - percent: Calculated percentage (0-1, so multiply by 100)   
                           We show percentage only to keep labels compact and inside bounds */
                        label={({percent}) => `${(percent! * 100).toFixed(0)}%`}

                        /* outerRadius: Size of the pie in pixels
                           Larger value = bigger pie
                           Reduced from 100+ to 80 to leave room for labels
                           Can also set innerRadius to create a donut chart */
                        outerRadius={80}
                        
                        /* fill: Default color (used if Cell components don't specify one)
                           We override this with Cell components below */
                        fill="#8884d8"
                        
                        /* dataKey: Which field from data objects determines slice size
                           Example: {name: "Completed", value: 42}
                           The "value" field determines how big the slice is */
                        dataKey="value"
                    >
                        {/* 
                            Cell: Allows customizing individual slices
                            We map over data to create one Cell per slice
                            Each Cell sets a specific color based on the status name
                            
                            Without Cells: All slices would be the same color
                            With Cells: Each status gets its own color from COLORS object
                        */}
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} 
                            />
                        ))}
                    </Pie>
                    
                    {/* Tooltip: Shows details when hovering over a slice */}
                    <Tooltip />
                    
                    {/* Legend: Shows color-coded labels for each slice
                       Automatically generated from data names */}
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
