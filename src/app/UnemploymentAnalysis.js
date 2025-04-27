"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';

// Hardcoded data matching your CSV structure
const HARDCODED_DATA = [
  { observation_date: "1994-01-01", UNRATE: 6.6 },
  { observation_date: "1994-02-01", UNRATE: 6.6 },
  { observation_date: "1994-03-01", UNRATE: 6.5 },
  { observation_date: "1994-04-01", UNRATE: 6.4 },
  { observation_date: "1994-05-01", UNRATE: 6.1 },
  { observation_date: "1994-06-01", UNRATE: 6.1 },
  { observation_date: "1994-07-01", UNRATE: 6.1 },
  { observation_date: "1994-08-01", UNRATE: 6.0 },
  { observation_date: "1994-09-01", UNRATE: 5.9 },
  { observation_date: "1994-10-01", UNRATE: 5.8 },
  { observation_date: "1994-11-01", UNRATE: 5.6 },
  { observation_date: "1994-12-01", UNRATE: 5.5 },
  { observation_date: "1995-01-01", UNRATE: 5.6 },
  { observation_date: "1995-02-01", UNRATE: 5.4 },
  { observation_date: "1995-03-01", UNRATE: 5.4 },
  { observation_date: "1995-04-01", UNRATE: 5.8 },
  { observation_date: "1995-05-01", UNRATE: 5.6 },
  { observation_date: "1995-06-01", UNRATE: 5.6 },
  { observation_date: "1995-07-01", UNRATE: 5.7 },
  { observation_date: "1995-08-01", UNRATE: 5.7 },
  { observation_date: "1995-09-01", UNRATE: 5.6 },
  { observation_date: "1995-10-01", UNRATE: 5.5 },
  { observation_date: "1995-11-01", UNRATE: 5.6 },
  { observation_date: "1995-12-01", UNRATE: 5.6 },
  { observation_date: "1996-01-01", UNRATE: 5.6 },
  { observation_date: "1996-02-01", UNRATE: 5.5 },
  { observation_date: "1996-03-01", UNRATE: 5.5 },
  { observation_date: "1996-04-01", UNRATE: 5.6 },
  { observation_date: "1996-05-01", UNRATE: 5.6 },
  { observation_date: "1996-06-01", UNRATE: 5.3 },
  { observation_date: "1996-07-01", UNRATE: 5.5 },
  { observation_date: "1996-08-01", UNRATE: 5.1 },
  { observation_date: "1996-09-01", UNRATE: 5.2 },
  { observation_date: "1996-10-01", UNRATE: 5.2 },
  { observation_date: "1996-11-01", UNRATE: 5.4 },
  { observation_date: "1996-12-01", UNRATE: 5.4 },
  { observation_date: "1997-01-01", UNRATE: 5.3 },
  { observation_date: "1997-02-01", UNRATE: 5.2 },
  { observation_date: "1997-03-01", UNRATE: 5.2 },
  { observation_date: "1997-04-01", UNRATE: 5.1 },
  { observation_date: "1997-05-01", UNRATE: 4.9 },
  { observation_date: "1997-06-01", UNRATE: 5.0 },
  { observation_date: "1997-07-01", UNRATE: 4.9 },
  { observation_date: "1997-08-01", UNRATE: 4.8 },
  { observation_date: "1997-09-01", UNRATE: 4.9 },
  { observation_date: "1997-10-01", UNRATE: 4.7 },
  { observation_date: "1997-11-01", UNRATE: 4.6 },
  { observation_date: "1997-12-01", UNRATE: 4.7 },
  { observation_date: "1998-01-01", UNRATE: 4.6 },
  { observation_date: "1998-02-01", UNRATE: 4.6 },
  { observation_date: "1998-03-01", UNRATE: 4.7 },
  { observation_date: "1998-04-01", UNRATE: 4.3 },
  { observation_date: "1998-05-01", UNRATE: 4.4 },
  { observation_date: "1998-06-01", UNRATE: 4.5 },
  { observation_date: "1998-07-01", UNRATE: 4.5 },
  { observation_date: "1998-08-01", UNRATE: 4.5 },
  { observation_date: "1998-09-01", UNRATE: 4.6 },
  { observation_date: "1998-10-01", UNRATE: 4.5 },
  { observation_date: "1998-11-01", UNRATE: 4.4 },
  { observation_date: "1998-12-01", UNRATE: 4.4 },
  { observation_date: "1999-01-01", UNRATE: 4.3 },
  { observation_date: "1999-02-01", UNRATE: 4.4 },
  { observation_date: "1999-03-01", UNRATE: 4.2 },
  { observation_date: "1999-04-01", UNRATE: 4.3 },
  { observation_date: "1999-05-01", UNRATE: 4.2 },
  { observation_date: "1999-06-01", UNRATE: 4.3 },
  { observation_date: "1999-07-01", UNRATE: 4.3 },
  { observation_date: "1999-08-01", UNRATE: 4.2 },
  { observation_date: "1999-09-01", UNRATE: 4.2 },
  { observation_date: "1999-10-01", UNRATE: 4.1 },
  { observation_date: "1999-11-01", UNRATE: 4.1 },
  { observation_date: "1999-12-01", UNRATE: 4.0 },
  { observation_date: "2000-01-01", UNRATE: 4.0 },
  { observation_date: "2000-02-01", UNRATE: 4.1 },
  { observation_date: "2000-03-01", UNRATE: 4.0 },
  { observation_date: "2000-04-01", UNRATE: 3.8 },
  { observation_date: "2000-05-01", UNRATE: 4.0 },
  { observation_date: "2000-06-01", UNRATE: 4.0 },
  { observation_date: "2000-07-01", UNRATE: 4.0 },
  { observation_date: "2000-08-01", UNRATE: 4.1 },
  { observation_date: "2000-09-01", UNRATE: 3.9 },
  { observation_date: "2000-10-01", UNRATE: 3.9 },
  { observation_date: "2000-11-01", UNRATE: 3.9 },
  { observation_date: "2000-12-01", UNRATE: 3.9 },
  { observation_date: "2001-01-01", UNRATE: 4.2 },
  { observation_date: "2001-02-01", UNRATE: 4.2 },
  { observation_date: "2001-03-01", UNRATE: 4.3 },
  { observation_date: "2001-04-01", UNRATE: 4.4 },
  { observation_date: "2001-05-01", UNRATE: 4.3 },
  { observation_date: "2001-06-01", UNRATE: 4.5 },
  { observation_date: "2001-07-01", UNRATE: 4.6 },
  { observation_date: "2001-08-01", UNRATE: 4.9 },
  { observation_date: "2001-09-01", UNRATE: 5.0 },
  { observation_date: "2001-10-01", UNRATE: 5.3 },
  { observation_date: "2001-11-01", UNRATE: 5.5 },
  { observation_date: "2001-12-01", UNRATE: 5.7 },
  { observation_date: "2002-01-01", UNRATE: 5.7 },
  { observation_date: "2002-02-01", UNRATE: 5.7 },
  { observation_date: "2002-03-01", UNRATE: 5.7 },
  { observation_date: "2002-04-01", UNRATE: 5.9 },
  { observation_date: "2002-05-01", UNRATE: 5.8 },
  { observation_date: "2002-06-01", UNRATE: 5.8 },
  { observation_date: "2002-07-01", UNRATE: 5.8 },
  { observation_date: "2002-08-01", UNRATE: 5.7 },
  { observation_date: "2002-09-01", UNRATE: 5.7 },
  { observation_date: "2002-10-01", UNRATE: 5.7 },
  { observation_date: "2002-11-01", UNRATE: 5.9 },
  { observation_date: "2002-12-01", UNRATE: 6.0 },
  { observation_date: "2003-01-01", UNRATE: 5.8 },
  { observation_date: "2003-02-01", UNRATE: 5.9 },
  { observation_date: "2003-03-01", UNRATE: 5.9 },
  { observation_date: "2003-04-01", UNRATE: 6.0 },
  { observation_date: "2003-05-01", UNRATE: 6.1 },
  { observation_date: "2003-06-01", UNRATE: 6.3 },
  { observation_date: "2003-07-01", UNRATE: 6.2 },
  { observation_date: "2003-08-01", UNRATE: 6.1 },
  { observation_date: "2003-09-01", UNRATE: 6.1 },
  { observation_date: "2003-10-01", UNRATE: 6.0 },
  { observation_date: "2003-11-01", UNRATE: 5.8 },
  { observation_date: "2003-12-01", UNRATE: 5.7 },
  { observation_date: "2004-01-01", UNRATE: 5.7 },
  { observation_date: "2004-02-01", UNRATE: 5.6 },
  { observation_date: "2004-03-01", UNRATE: 5.8 },
  { observation_date: "2004-04-01", UNRATE: 5.6 },
  { observation_date: "2004-05-01", UNRATE: 5.6 },
  { observation_date: "2004-06-01", UNRATE: 5.6 },
  { observation_date: "2004-07-01", UNRATE: 5.5 },
  { observation_date: "2004-08-01", UNRATE: 5.4 },
  { observation_date: "2004-09-01", UNRATE: 5.4 },
  { observation_date: "2004-10-01", UNRATE: 5.5 },
  { observation_date: "2004-11-01", UNRATE: 5.4 },
  { observation_date: "2004-12-01", UNRATE: 5.4 },
  { observation_date: "2005-01-01", UNRATE: 5.3 },
  { observation_date: "2005-02-01", UNRATE: 5.4 },
  { observation_date: "2005-03-01", UNRATE: 5.2 },
  { observation_date: "2005-04-01", UNRATE: 5.2 },
  { observation_date: "2005-05-01", UNRATE: 5.1 },
  { observation_date: "2005-06-01", UNRATE: 5.0 },
  { observation_date: "2005-07-01", UNRATE: 5.0 },
  { observation_date: "2005-08-01", UNRATE: 4.9 },
  { observation_date: "2005-09-01", UNRATE: 5.0 },
  { observation_date: "2005-10-01", UNRATE: 5.0 },
  { observation_date: "2005-11-01", UNRATE: 5.0 },
  { observation_date: "2005-12-01", UNRATE: 4.9 },
  { observation_date: "2006-01-01", UNRATE: 4.7 },
  { observation_date: "2006-02-01", UNRATE: 4.8 },
  { observation_date: "2006-03-01", UNRATE: 4.7 },
  { observation_date: "2006-04-01", UNRATE: 4.7 },
  { observation_date: "2006-05-01", UNRATE: 4.6 },
  { observation_date: "2006-06-01", UNRATE: 4.6 },
  { observation_date: "2006-07-01", UNRATE: 4.7 },
  { observation_date: "2006-08-01", UNRATE: 4.7 },
  { observation_date: "2006-09-01", UNRATE: 4.5 },
  { observation_date: "2006-10-01", UNRATE: 4.4 },
  { observation_date: "2006-11-01", UNRATE: 4.5 },
  { observation_date: "2006-12-01", UNRATE: 4.4 },
  { observation_date: "2007-01-01", UNRATE: 4.6 },
  { observation_date: "2007-02-01", UNRATE: 4.5 },
  { observation_date: "2007-03-01", UNRATE: 4.4 },
  { observation_date: "2007-04-01", UNRATE: 4.5 },
  { observation_date: "2007-05-01", UNRATE: 4.4 },
  { observation_date: "2007-06-01", UNRATE: 4.6 },
  { observation_date: "2007-07-01", UNRATE: 4.7 },
  { observation_date: "2007-08-01", UNRATE: 4.6 },
  { observation_date: "2007-09-01", UNRATE: 4.7 },
  { observation_date: "2007-10-01", UNRATE: 4.7 },
  { observation_date: "2007-11-01", UNRATE: 4.7 },
  { observation_date: "2007-12-01", UNRATE: 5.0 }
];

const UnemploymentChartWithCSVData = () => {
  const [unemploymentData, setUnemploymentData] = useState(HARDCODED_DATA);
  const [dateRange, setDateRange] = useState('all');
  
  // Format date for display (convert YYYY-MM-DD to MMM YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (dateRange === 'all' || unemploymentData.length === 0) {
      return unemploymentData;
    }

    const now = new Date('2007-12-01'); // Use the last date in your dataset as reference
    let startDate;

    switch (dateRange) {
      case '10years':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), 1);
        break;
      case '5years':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);
        break;
      case '2years':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        return unemploymentData;
    }

    return unemploymentData.filter(item => new Date(item.observation_date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Get min and max values for y-axis domain with some padding
  const getYAxisDomain = () => {
    if (filteredData.length === 0) return [0, 10];
    
    const rates = filteredData.map(item => Number(item.UNRATE));
    const min = Math.floor(Math.min(...rates));
    const max = Math.ceil(Math.max(...rates));
    
    return [Math.max(0, min - 0.5), max + 0.5];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Unemployment Rate Analysis</h2>
      
      <p className="mb-4">
        The unemployment rate measures the share of workers in the labor force who do not currently have a job but are actively looking for work.
      </p>
      
      <div className="mb-4">
        <label className="mr-2 font-medium">Time Period:</label>
        <select 
          className="border rounded p-1" 
          value={dateRange} 
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="all">All Data (1994-2007)</option>
          <option value="10years">Last 10 Years</option>
          <option value="5years">Last 5 Years</option>
          <option value="2years">Last 2 Years</option>
          <option value="1year">Last Year</option>
        </select>
      </div>
      
      {/* Current unemployment stats */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Current Unemployment Rate</div>
            <div className="text-3xl font-bold text-blue-600">
              {Number(filteredData[filteredData.length - 1].UNRATE).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData[filteredData.length - 1].observation_date)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Historical Low</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.min(...filteredData.map(d => Number(d.UNRATE))).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData.find(d => Number(d.UNRATE) === Math.min(...filteredData.map(d => Number(d.UNRATE)))).observation_date)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Historical High</div>
            <div className="text-2xl font-bold text-red-600">
              {Math.max(...filteredData.map(d => Number(d.UNRATE))).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData.find(d => Number(d.UNRATE) === Math.max(...filteredData.map(d => Number(d.UNRATE)))).observation_date)}
            </div>
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="h-96 w-full border border-gray-200 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="observation_date" 
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={getYAxisDomain()}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Unemployment Rate']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="UNRATE" 
              stroke="#2563eb"
              fill="#dbeafe" 
              name="Unemployment Rate (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Key Insights:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>The US unemployment rate ranged from 3.8% to 6.6% between 1994 and 2007.</li>
          <li>The unemployment rate peaked in 1994 and reached its lowest point in 2000.</li>
          <li>The data shows clear economic cycles with periods of rising and falling unemployment.</li>
          <li>The natural rate of unemployment (full employment) is generally considered to be around 4-5%.</li>
          <li>The unemployment rate is a lagging economic indicator, meaning it changes after the economy has begun to follow a particular trend.</li>
        </ul>
      </div>
    </div>
  );
};

export default UnemploymentChartWithCSVData;