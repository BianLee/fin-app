"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import Papa from 'papaparse';

const FedFundAnalysis = () => {
  const [fedFundData, setFedFundData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'all', '10years', '5years', '2years', '1year'
  const [showRecessions, setShowRecessions] = useState(true);
  
  // Sample recession periods (you can replace with actual data)
  const recessions = [
    { start: '2007-12-01', end: '2009-06-01', name: '2008 Financial Crisis' },
    { start: '2001-03-01', end: '2001-11-01', name: '2001 Recession' },
    { start: '1990-07-01', end: '1991-03-01', name: '1990-91 Recession' },
    { start: '1981-07-01', end: '1982-11-01', name: '1981-82 Recession' },
    { start: '2020-02-01', end: '2020-04-01', name: 'COVID-19 Recession' }
  ];

  useEffect(() => {
    const loadFedFundData = async () => {
      try {
        setLoading(true);
        // Load the CSV file from public directory using window.fs API
        const csvText = await window.fs.readFile('/public/FEDFUNDS.csv', { encoding: 'utf8' });
        
        // Parse CSV data
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Transform data for charting
            const transformedData = results.data.map(row => {
              // FRED data typically has DATE and VALUE columns
              return {
                date: row.date || row.DATE, // Handle different possible column names
                rate: row.rate || row.FEDFUNDS || row.value || row.VALUE, // Handle different possible column names including FRED's VALUE
              };
            }).filter(item => item.date && item.rate !== undefined);
            
            // Sort by date if needed
            transformedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setFedFundData(transformedData);
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Failed to parse data');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    loadFedFundData();
  }, []);

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (dateRange === 'all' || fedFundData.length === 0) {
      return fedFundData;
    }

    const now = new Date();
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
        return fedFundData;
    }

    return fedFundData.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Get visible recessions based on filtered data
  const getVisibleRecessions = () => {
    if (!showRecessions || filteredData.length === 0) return [];
    
    const firstDate = new Date(filteredData[0].date);
    const lastDate = new Date(filteredData[filteredData.length - 1].date);
    
    return recessions.filter(recession => {
      const recStart = new Date(recession.start);
      const recEnd = new Date(recession.end);
      return (recStart <= lastDate && recEnd >= firstDate);
    });
  };

  const visibleRecessions = getVisibleRecessions();

  // Get min and max values for y-axis domain
  const getYAxisDomain = () => {
    if (filteredData.length === 0) return [0, 10]; // Default domain
    
    const rates = filteredData.map(item => item.rate);
    const min = Math.floor(Math.min(...rates));
    const max = Math.ceil(Math.max(...rates));
    
    // Add some padding
    return [Math.max(0, min - 1), max + 1];
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Federal Funds Rate Analysis</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Federal Funds Rate Analysis</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Federal Funds Rate Analysis</h2>
      <p className="mb-4">
        The federal funds rate is the interest rate at which depository institutions lend reserve balances to other depository institutions overnight.
      </p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="mr-2 font-medium">Time Period:</label>
          <select 
            className="border rounded p-1" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Data</option>
            <option value="10years">Last 10 Years</option>
            <option value="5years">Last 5 Years</option>
            <option value="2years">Last 2 Years</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="showRecessions" 
            checked={showRecessions} 
            onChange={(e) => setShowRecessions(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showRecessions">Show Recession Periods</label>
        </div>
      </div>
      
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              domain={getYAxisDomain()}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value) => [`${value.toFixed(2)}%`, 'Fed Funds Rate']}
            />
            <Legend />
            
            {/* Render recession reference areas */}
            {showRecessions && visibleRecessions.map((recession, index) => (
              <ReferenceLine
                key={index}
                x={recession.start}
                stroke="rgba(255, 0, 0, 0.5)"
                label={{ value: recession.name, position: 'insideTopRight', fill: 'red' }}
              />
            ))}
            
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#2563eb" 
              dot={false}
              name="Fed Funds Rate (%)"
            />
            
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#8884d8"
              tickFormatter={formatDate}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Key Insights:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>The federal funds rate is a key monetary policy tool used by the Federal Reserve.</li>
          <li>Lower rates stimulate economic growth but may increase inflation risk.</li>
          <li>Higher rates help control inflation but may slow economic growth.</li>
          <li>Rate cuts often occur during economic downturns (gray shaded recession periods).</li>
          <li>The Fed typically raises rates during economic expansions to prevent overheating.</li>
        </ul>
      </div>
    </div>
  );
};

export default FedFundAnalysis;