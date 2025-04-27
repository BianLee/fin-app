"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import Papa from 'papaparse';

const UnemploymentAnalysis = () => {
  const [unemploymentData, setUnemploymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'all', '10years', '5years', '2years', '1year'
  const [viewMode, setViewMode] = useState('trend'); // 'trend', 'comparison', 'demographics'
  
  // Sample demographic categories (for demonstration)
  const demographicGroups = [
    { id: 'overall', name: 'Overall', color: '#2563eb' },
    { id: 'male', name: 'Male', color: '#3b82f6' },
    { id: 'female', name: 'Female', color: '#ec4899' },
    { id: 'white', name: 'White', color: '#6b7280' },
    { id: 'black', name: 'Black', color: '#1d4ed8' },
    { id: 'hispanic', name: 'Hispanic', color: '#84cc16' },
    { id: 'asian', name: 'Asian', color: '#ea580c' },
    { id: 'youth', name: '16-24 years', color: '#8b5cf6' }
  ];

  useEffect(() => {
    const loadUnemploymentData = async () => {
      try {
        setLoading(true);
        // Load the CSV file from public directory using window.fs API
        const csvText = await window.fs.readFile('/public/UNRATE.csv', { encoding: 'utf8' });
        
        // Parse CSV data
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Transform data for charting
            const transformedData = results.data.map(row => {
              // Assuming date format is YYYY-MM-DD in the CSV
              // And that we have columns for different demographic categories
              return {
                date: row.date || row.DATE, // Handle different possible column names
                overall: row.overall || row.UNRATE || row.unemployment, // Handle different possible column names
                // Include demographics if available
                male: row.male,
                female: row.female,
                white: row.white,
                black: row.black,
                hispanic: row.hispanic,
                asian: row.asian,
                youth: row.youth || row['16-24']
              };
            }).filter(item => item.date && item.overall !== undefined);
            
            // Sort by date if needed
            transformedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setUnemploymentData(transformedData);
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

    loadUnemploymentData();
  }, []);

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (dateRange === 'all' || unemploymentData.length === 0) {
      return unemploymentData;
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
        return unemploymentData;
    }

    return unemploymentData.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Get min and max values for y-axis domain
  const getYAxisDomain = () => {
    if (filteredData.length === 0) return [0, 10]; // Default domain
    
    // For trend view, just look at overall rate
    if (viewMode === 'trend') {
      const rates = filteredData.map(item => item.overall);
      const min = Math.floor(Math.min(...rates));
      const max = Math.ceil(Math.max(...rates));
      return [Math.max(0, min - 1), max + 1];
    }
    
    // For demographic comparison, consider all demographic values
    const allRates = [];
    demographicGroups.forEach(group => {
      filteredData.forEach(item => {
        if (item[group.id] !== undefined) {
          allRates.push(item[group.id]);
        }
      });
    });
    
    if (allRates.length === 0) return [0, 10];
    
    const min = Math.floor(Math.min(...allRates));
    const max = Math.ceil(Math.max(...allRates));
    return [Math.max(0, min - 1), max + 1];
  };

  // Prepare demographic data for most recent period
  const getLatestDemographicData = () => {
    if (filteredData.length === 0) return [];
    
    const latestData = filteredData[filteredData.length - 1];
    return demographicGroups
      .filter(group => latestData[group.id] !== undefined)
      .map(group => ({
        name: group.name,
        value: latestData[group.id],
        color: group.color
      }))
      .sort((a, b) => b.value - a.value); // Sort highest to lowest
  };

  // Calculate the current 12-month change in unemployment
  const getYearOverYearChange = () => {
    if (filteredData.length < 13) return null;
    
    const current = filteredData[filteredData.length - 1].overall;
    const yearAgo = filteredData[filteredData.length - 13].overall;
    
    return {
      absolute: (current - yearAgo).toFixed(1),
      percent: (((current - yearAgo) / yearAgo) * 100).toFixed(1)
    };
  };

  const yearOverYearChange = getYearOverYearChange();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Unemployment Rate Analysis</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Unemployment Rate Analysis</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Unemployment Rate Analysis</h2>
      <p className="mb-4">
        The unemployment rate measures the share of workers in the labor force who do not currently have a job but are actively looking for work.
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
        
        <div>
          <label className="mr-2 font-medium">View Mode:</label>
          <select 
            className="border rounded p-1" 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="trend">Historical Trend</option>
            <option value="comparison">Demographic Comparison</option>
            <option value="demographics">Current Demographics</option>
          </select>
        </div>
      </div>
      
      {/* Current unemployment stats */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Current Unemployment Rate</div>
            <div className="text-3xl font-bold text-blue-600">
              {filteredData[filteredData.length - 1].overall.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData[filteredData.length - 1].date)}
            </div>
          </div>
          
          {yearOverYearChange && (
            <div className={`p-4 rounded-lg text-center ${yearOverYearChange.absolute < 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm text-gray-600">Year-over-Year Change</div>
              <div className={`text-2xl font-bold ${yearOverYearChange.absolute < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearOverYearChange.absolute > 0 ? '+' : ''}{yearOverYearChange.absolute}%
              </div>
              <div className="text-xs text-gray-500">
                ({yearOverYearChange.absolute > 0 ? '+' : ''}{yearOverYearChange.percent}%)
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Historical Peak</div>
            <div className="text-2xl font-bold text-gray-800">
              {Math.max(...filteredData.map(d => d.overall)).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData.find(d => d.overall === Math.max(...filteredData.map(d => d.overall))).date)}
            </div>
          </div>
        </div>
      )}
      
      <div className="h-96 w-full">
        {viewMode === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
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
                formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="overall" 
                stroke="#2563eb"
                fill="#dbeafe" 
                name="Unemployment Rate (%)"
              />
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#8884d8"
                tickFormatter={formatDate}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'comparison' && (
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
                formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
              />
              <Legend />
              
              {demographicGroups.map(group => (
                filteredData.some(item => item[group.id] !== undefined) && (
                  <Line 
                    key={group.id}
                    type="monotone" 
                    dataKey={group.id} 
                    stroke={group.color}
                    name={group.name}
                    dot={false}
                  />
                )
              ))}
              
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="#8884d8"
                tickFormatter={formatDate}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'demographics' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              layout="vertical"
              data={getLatestDemographicData()}
              margin={{ top: 20, right: 20, bottom: 20, left: 80 }}
            >
              <CartesianGrid stroke="#f5f5f5" />
              <XAxis type="number" domain={[0, 'auto']} />
              <YAxis dataKey="name" type="category" scale="band" width={80} />
              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Unemployment Rate']} />
              <Legend />
              <Bar dataKey="value" barSize={30} name="Unemployment Rate (%)">
                {getLatestDemographicData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Key Insights:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Unemployment rises sharply during recessions and falls gradually during recoveries.</li>
          <li>The natural rate of unemployment (full employment) is generally considered to be around 4-5%.</li>
          <li>Certain demographic groups typically experience higher unemployment rates than others.</li>
          <li>The unemployment rate is a lagging economic indicator, meaning it changes after the economy has begun to follow a particular trend.</li>
          <li>Changes in unemployment rate should be considered alongside labor force participation rate for a complete picture.</li>
        </ul>
      </div>
    </div>
  );
};

export default UnemploymentAnalysis;