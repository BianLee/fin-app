"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Papa from 'papaparse';

// Hardcoded data matching your CSV structure
const HARDCODED_DATA = [
  { observation_date: "1994-01-01", INDPRO: 66.7591 },
  { observation_date: "1994-02-01", INDPRO: 66.8019 },
  { observation_date: "1994-03-01", INDPRO: 67.4704 },
  { observation_date: "1994-04-01", INDPRO: 67.8707 },
  { observation_date: "1994-05-01", INDPRO: 68.1870 },
  { observation_date: "1994-06-01", INDPRO: 68.6450 },
  { observation_date: "1994-07-01", INDPRO: 68.7317 },
  { observation_date: "1994-08-01", INDPRO: 69.1882 },
  { observation_date: "1994-09-01", INDPRO: 69.3935 },
  { observation_date: "1994-10-01", INDPRO: 69.9576 },
  { observation_date: "1994-11-01", INDPRO: 70.4288 },
  { observation_date: "1994-12-01", INDPRO: 71.1273 },
  { observation_date: "1995-01-01", INDPRO: 71.2635 },
  { observation_date: "1995-02-01", INDPRO: 71.1758 },
  { observation_date: "1995-03-01", INDPRO: 71.2796 },
  { observation_date: "1995-04-01", INDPRO: 71.1538 },
  { observation_date: "1995-05-01", INDPRO: 71.4997 },
  { observation_date: "1995-06-01", INDPRO: 71.7327 },
  { observation_date: "1995-07-01", INDPRO: 71.4334 },
  { observation_date: "1995-08-01", INDPRO: 72.3723 },
  { observation_date: "1995-09-01", INDPRO: 72.6543 },
  { observation_date: "1995-10-01", INDPRO: 72.5336 },
  { observation_date: "1995-11-01", INDPRO: 72.7170 },
  { observation_date: "1995-12-01", INDPRO: 72.9638 },
  { observation_date: "1996-01-01", INDPRO: 72.5712 },
  { observation_date: "1996-02-01", INDPRO: 73.6207 },
  { observation_date: "1996-03-01", INDPRO: 73.5141 },
  { observation_date: "1996-04-01", INDPRO: 74.2491 },
  { observation_date: "1996-05-01", INDPRO: 74.8142 },
  { observation_date: "1996-06-01", INDPRO: 75.3726 },
  { observation_date: "1996-07-01", INDPRO: 75.3738 },
  { observation_date: "1996-08-01", INDPRO: 75.7557 },
  { observation_date: "1996-09-01", INDPRO: 76.2302 },
  { observation_date: "1996-10-01", INDPRO: 76.2157 },
  { observation_date: "1996-11-01", INDPRO: 76.8973 },
  { observation_date: "1996-12-01", INDPRO: 77.3772 },
  { observation_date: "1997-01-01", INDPRO: 77.5135 },
  { observation_date: "1997-02-01", INDPRO: 78.4255 },
  { observation_date: "1997-03-01", INDPRO: 78.9197 },
  { observation_date: "1997-04-01", INDPRO: 78.9848 },
  { observation_date: "1997-05-01", INDPRO: 79.4296 },
  { observation_date: "1997-06-01", INDPRO: 79.7971 },
  { observation_date: "1997-07-01", INDPRO: 80.4666 },
  { observation_date: "1997-08-01", INDPRO: 81.2825 },
  { observation_date: "1997-09-01", INDPRO: 82.0327 },
  { observation_date: "1997-10-01", INDPRO: 82.7656 },
  { observation_date: "1997-11-01", INDPRO: 83.4270 },
  { observation_date: "1997-12-01", INDPRO: 83.7840 },
  { observation_date: "1998-01-01", INDPRO: 84.1564 },
  { observation_date: "1998-02-01", INDPRO: 84.3066 },
  { observation_date: "1998-03-01", INDPRO: 84.3420 },
  { observation_date: "1998-04-01", INDPRO: 84.6339 },
  { observation_date: "1998-05-01", INDPRO: 85.1867 },
  { observation_date: "1998-06-01", INDPRO: 84.6809 },
  { observation_date: "1998-07-01", INDPRO: 84.3445 },
  { observation_date: "1998-08-01", INDPRO: 86.0816 },
  { observation_date: "1998-09-01", INDPRO: 86.0023 },
  { observation_date: "1998-10-01", INDPRO: 86.5910 },
  { observation_date: "1998-11-01", INDPRO: 86.5115 },
  { observation_date: "1998-12-01", INDPRO: 86.8615 },
  { observation_date: "1999-01-01", INDPRO: 87.2205 },
  { observation_date: "1999-02-01", INDPRO: 87.7260 },
  { observation_date: "1999-03-01", INDPRO: 87.9125 },
  { observation_date: "1999-04-01", INDPRO: 88.1082 },
  { observation_date: "1999-05-01", INDPRO: 88.6483 },
  { observation_date: "1999-06-01", INDPRO: 88.5903 },
  { observation_date: "1999-07-01", INDPRO: 89.1098 },
  { observation_date: "1999-08-01", INDPRO: 89.5007 },
  { observation_date: "1999-09-01", INDPRO: 89.1304 },
  { observation_date: "1999-10-01", INDPRO: 90.2709 },
  { observation_date: "1999-11-01", INDPRO: 90.7528 },
  { observation_date: "1999-12-01", INDPRO: 91.4784 },
  { observation_date: "2000-01-01", INDPRO: 91.4092 },
  { observation_date: "2000-02-01", INDPRO: 91.7245 },
  { observation_date: "2000-03-01", INDPRO: 92.0830 },
  { observation_date: "2000-04-01", INDPRO: 92.6659 },
  { observation_date: "2000-05-01", INDPRO: 92.9347 },
  { observation_date: "2000-06-01", INDPRO: 93.0018 },
  { observation_date: "2000-07-01", INDPRO: 92.8373 },
  { observation_date: "2000-08-01", INDPRO: 92.5910 },
  { observation_date: "2000-09-01", INDPRO: 92.9827 },
  { observation_date: "2000-10-01", INDPRO: 92.6400 },
  { observation_date: "2000-11-01", INDPRO: 92.6604 },
  { observation_date: "2000-12-01", INDPRO: 92.3457 },
  { observation_date: "2001-01-01", INDPRO: 91.8908 },
  { observation_date: "2001-02-01", INDPRO: 91.2851 },
  { observation_date: "2001-03-01", INDPRO: 91.0585 },
  { observation_date: "2001-04-01", INDPRO: 90.7384 },
  { observation_date: "2001-05-01", INDPRO: 90.2607 },
  { observation_date: "2001-06-01", INDPRO: 89.7811 },
  { observation_date: "2001-07-01", INDPRO: 89.2352 },
  { observation_date: "2001-08-01", INDPRO: 89.1570 },
  { observation_date: "2001-09-01", INDPRO: 88.6749 },
  { observation_date: "2001-10-01", INDPRO: 88.4051 },
  { observation_date: "2001-11-01", INDPRO: 87.8860 },
  { observation_date: "2001-12-01", INDPRO: 87.8518 },
  { observation_date: "2002-01-01", INDPRO: 88.4634 },
  { observation_date: "2002-02-01", INDPRO: 88.4578 },
  { observation_date: "2002-03-01", INDPRO: 89.1265 },
  { observation_date: "2002-04-01", INDPRO: 89.5507 },
  { observation_date: "2002-05-01", INDPRO: 89.9348 },
  { observation_date: "2002-06-01", INDPRO: 90.6736 },
  { observation_date: "2002-07-01", INDPRO: 90.6436 },
  { observation_date: "2002-08-01", INDPRO: 90.5505 },
  { observation_date: "2002-09-01", INDPRO: 90.6373 },
  { observation_date: "2002-10-01", INDPRO: 90.3988 },
  { observation_date: "2002-11-01", INDPRO: 90.8947 },
  { observation_date: "2002-12-01", INDPRO: 90.3906 },
  { observation_date: "2003-01-01", INDPRO: 91.1369 },
  { observation_date: "2003-02-01", INDPRO: 91.2505 },
  { observation_date: "2003-03-01", INDPRO: 91.0006 },
  { observation_date: "2003-04-01", INDPRO: 90.4311 },
  { observation_date: "2003-05-01", INDPRO: 90.4000 },
  { observation_date: "2003-06-01", INDPRO: 90.5196 },
  { observation_date: "2003-07-01", INDPRO: 90.9869 },
  { observation_date: "2003-08-01", INDPRO: 90.7933 },
  { observation_date: "2003-09-01", INDPRO: 91.3819 },
  { observation_date: "2003-10-01", INDPRO: 91.5049 },
  { observation_date: "2003-11-01", INDPRO: 92.1265 },
  { observation_date: "2003-12-01", INDPRO: 92.1732 },
  { observation_date: "2004-01-01", INDPRO: 92.3268 },
  { observation_date: "2004-02-01", INDPRO: 92.8995 },
  { observation_date: "2004-03-01", INDPRO: 92.5368 },
  { observation_date: "2004-04-01", INDPRO: 92.8957 },
  { observation_date: "2004-05-01", INDPRO: 93.5845 },
  { observation_date: "2004-06-01", INDPRO: 92.8651 },
  { observation_date: "2004-07-01", INDPRO: 93.5502 },
  { observation_date: "2004-08-01", INDPRO: 93.6301 },
  { observation_date: "2004-09-01", INDPRO: 93.7353 },
  { observation_date: "2004-10-01", INDPRO: 94.5695 },
  { observation_date: "2004-11-01", INDPRO: 94.8015 },
  { observation_date: "2004-12-01", INDPRO: 95.5415 },
  { observation_date: "2005-01-01", INDPRO: 95.8785 },
  { observation_date: "2005-02-01", INDPRO: 96.5709 },
  { observation_date: "2005-03-01", INDPRO: 96.4345 },
  { observation_date: "2005-04-01", INDPRO: 96.6347 },
  { observation_date: "2005-05-01", INDPRO: 96.7251 },
  { observation_date: "2005-06-01", INDPRO: 97.1483 },
  { observation_date: "2005-07-01", INDPRO: 96.8397 },
  { observation_date: "2005-08-01", INDPRO: 97.1584 },
  { observation_date: "2005-09-01", INDPRO: 95.2764 },
  { observation_date: "2005-10-01", INDPRO: 96.4411 },
  { observation_date: "2005-11-01", INDPRO: 97.5016 },
  { observation_date: "2005-12-01", INDPRO: 97.9723 },
  { observation_date: "2006-01-01", INDPRO: 98.1270 },
  { observation_date: "2006-02-01", INDPRO: 98.1687 },
  { observation_date: "2006-03-01", INDPRO: 98.3913 },
  { observation_date: "2006-04-01", INDPRO: 98.6826 },
  { observation_date: "2006-05-01", INDPRO: 98.7074 },
  { observation_date: "2006-06-01", INDPRO: 99.0398 },
  { observation_date: "2006-07-01", INDPRO: 98.9751 },
  { observation_date: "2006-08-01", INDPRO: 99.4047 },
  { observation_date: "2006-09-01", INDPRO: 99.2246 },
  { observation_date: "2006-10-01", INDPRO: 99.1229 },
  { observation_date: "2006-11-01", INDPRO: 99.0963 },
  { observation_date: "2006-12-01", INDPRO: 100.1125 },
  { observation_date: "2007-01-01", INDPRO: 99.7546 },
  { observation_date: "2007-02-01", INDPRO: 100.7166 },
  { observation_date: "2007-03-01", INDPRO: 100.8952 },
  { observation_date: "2007-04-01", INDPRO: 101.5723 },
  { observation_date: "2007-05-01", INDPRO: 101.6269 },
  { observation_date: "2007-06-01", INDPRO: 101.6547 },
  { observation_date: "2007-07-01", INDPRO: 101.4953 },
  { observation_date: "2007-08-01", INDPRO: 101.6943 },
  { observation_date: "2007-09-01", INDPRO: 101.9428 },
  { observation_date: "2007-10-01", INDPRO: 101.6446 },
  { observation_date: "2007-11-01", INDPRO: 102.2167 },
  { observation_date: "2007-12-01", INDPRO: 102.2764 }
];

const IndustrialProductionChart = () => {
  const [indProData, setIndProData] = useState(HARDCODED_DATA);
  const [dateRange, setDateRange] = useState('all');
  const [viewMode, setViewMode] = useState('trend');
  
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

  // Calculate growth rates for YoY comparison
  const calculateGrowthRates = () => {
    if (indProData.length < 13) return [];
    
    return indProData.map((item, index) => {
      if (index < 12) return { ...item, growthRate: null };
      
      const previousYear = indProData[index - 12].INDPRO;
      const currentValue = item.INDPRO;
      const growthRate = ((currentValue - previousYear) / previousYear) * 100;
      
      return {
        ...item,
        growthRate: growthRate
      };
    }).filter(item => item.growthRate !== null);
  };

  // Filter data based on selected date range
  const getFilteredData = () => {
    if (dateRange === 'all' || indProData.length === 0) {
      return indProData;
    }

    const now = new Date('2007-12-01'); // Use the last date in the dataset as reference
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
        return indProData;
    }

    return indProData.filter(item => new Date(item.observation_date) >= startDate);
  };

  const filteredData = getFilteredData();
  const growthRateData = calculateGrowthRates().filter(item => 
    filteredData.some(d => d.observation_date === item.observation_date)
  );

  // Get min and max values for y-axis domain with some padding
  const getYAxisDomain = () => {
    if (filteredData.length === 0) return [60, 110];
    
    if (viewMode === 'trend') {
      const values = filteredData.map(item => Number(item.INDPRO));
      const min = Math.floor(Math.min(...values));
      const max = Math.ceil(Math.max(...values));
      
      return [Math.max(0, min - 5), max + 5];
    } else if (viewMode === 'growth') {
      const growthRates = growthRateData.map(item => Number(item.growthRate));
      const min = Math.floor(Math.min(...growthRates));
      const max = Math.ceil(Math.max(...growthRates));
      
      return [min - 1, max + 1];
    }
    
    return [60, 110]; // Default
  };

  // Calculate year-over-year percent change
  const getYearOverYearChange = () => {
    if (filteredData.length < 13) return null;
    
    const current = filteredData[filteredData.length - 1].INDPRO;
    const yearAgo = filteredData.find(item => 
      item.observation_date === new Date(
        new Date(filteredData[filteredData.length - 1].observation_date).setFullYear(
          new Date(filteredData[filteredData.length - 1].observation_date).getFullYear() - 1
        )
      ).toISOString().split('T')[0]
    )?.INDPRO || filteredData[filteredData.length - 13].INDPRO;
    
    return {
      absolute: (current - yearAgo).toFixed(2),
      percent: (((current - yearAgo) / yearAgo) * 100).toFixed(2)
    };
  };

  // Calculate compound annual growth rate (CAGR)
  const calculateCAGR = () => {
    if (filteredData.length <= 1) return null;
    
    const startValue = filteredData[0].INDPRO;
    const endValue = filteredData[filteredData.length - 1].INDPRO;
    const startDate = new Date(filteredData[0].observation_date);
    const endDate = new Date(filteredData[filteredData.length - 1].observation_date);
    
    // Calculate years between dates
    const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (years < 0.5) return null; // Need at least 6 months of data
    
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  };

  const yearOverYearChange = getYearOverYearChange();
  const cagr = calculateCAGR();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Industrial Production Index Analysis</h2>
      
      <p className="mb-4">
        The Industrial Production Index (INDPRO) measures real output for manufacturing, mining, and utility sectors. The index is referenced to a base year (2017 = 100).
      </p>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
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
        
        <div>
          <label className="mr-2 font-medium">View Mode:</label>
          <select 
            className="border rounded p-1" 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="trend">Index Values</option>
            <option value="growth">YoY Growth Rates</option>
          </select>
        </div>
      </div>
      
      {/* Current stats */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Current Index Value</div>
            <div className="text-3xl font-bold text-blue-600">
              {Number(filteredData[filteredData.length - 1].INDPRO).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(filteredData[filteredData.length - 1].observation_date)}
            </div>
          </div>
          
          {yearOverYearChange && (
            <div className={`p-4 rounded-lg text-center ${Number(yearOverYearChange.percent) > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm text-gray-600">Year-over-Year Change</div>
              <div className={`text-2xl font-bold ${Number(yearOverYearChange.percent) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {yearOverYearChange.percent > 0 ? '+' : ''}{yearOverYearChange.percent}%
              </div>
              <div className="text-xs text-gray-500">
                ({yearOverYearChange.absolute > 0 ? '+' : ''}{yearOverYearChange.absolute} points)
              </div>
            </div>
          )}
          
          {cagr !== null && (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600">Avg. Annual Growth</div>
              <div className={`text-2xl font-bold ${cagr > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {cagr > 0 ? '+' : ''}{cagr.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">
                CAGR over selected period
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Chart */}
      <div className="h-96 w-full border border-gray-200 rounded">
        {viewMode === 'trend' && (
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
                label={{ value: 'Index (2017=100)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [`${Number(value).toFixed(2)}`, 'Industrial Production Index']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="INDPRO" 
                stroke="#3b82f6"
                fill="#dbeafe" 
                name="Industrial Production Index"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {viewMode === 'growth' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthRateData}
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
                label={{ value: 'YoY Growth (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'YoY Growth Rate']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="growthRate" 
                stroke="#10b981"
                name="YoY Growth Rate (%)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Key Insights:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Industrial Production Index shows the real output of the manufacturing, mining, and electric and gas utilities sectors.</li>
          <li>The index increased by approximately 53% between 1994 and 2007, showing consistent long-term economic growth.</li>
          <li>The data shows a notable dip during the 2001 recession, with a recovery beginning in 2002.</li>
          <li>There was significant growth during the late 1990s tech boom, with a slower but still positive growth trend through most of the 2000s.</li>
          <li>By the end of 2007, the index had just crossed the 100 mark, which would later be used as a reference point (with 2017 set as the base year of 100).</li>
        </ul>
      </div>
    </div>
  );
};

export default IndustrialProductionChart;