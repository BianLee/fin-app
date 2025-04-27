"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BeerDistributionGame from './BeerDistributionGame';
import TariffSimulator from './TariffSimulator';
import TariffGame from './TariffGame';

const Home = () => {
  // Navigation state management
  const [mainCategory, setMainCategory] = useState('finance'); // 'finance' or 'games'
  const [financeTab, setFinanceTab] = useState('bonds');
  const [gameTab, setGameTab] = useState('beer');
  const [analysisTab, setAnalysisTab] = useState("fedfund");
  
  // ----- DATA DEFINITIONS -----
  // Initial bond data
  const initialBondData = [
    { price: 950, quantity: 100, interest: 5.3 },
    { price: 900, quantity: 200, interest: 11.1 },
    { price: 850, quantity: 300, interest: 17.6 },
    { price: 800, quantity: 400, interest: 25.0 },
    { price: 750, quantity: 500, interest: 33.0 },
  ];
  
  // Data for money supply and interest rates
  const moneyData = [
    { year: '1950', interestRate: 1.2, m2Growth: 4.5 },
    { year: '1960', interestRate: 2.9, m2Growth: 7.0 },
    { year: '1970', interestRate: 6.4, m2Growth: 12.8 },
    { year: '1980', interestRate: 13.4, m2Growth: 9.5 },
    { year: '1990', interestRate: 7.8, m2Growth: 4.0 },
    { year: '2000', interestRate: 5.8, m2Growth: 6.2 },
    { year: '2010', interestRate: 0.2, m2Growth: 3.5 },
    { year: '2020', interestRate: 0.1, m2Growth: 24.0 },
  ];
  
  // Fisher effect data showing relation between inflation and interest rates
  const fisherData = [
    { inflation: 0, nominalRate: 2, realRate: 2 },
    { inflation: 2, nominalRate: 4, realRate: 2 },
    { inflation: 4, nominalRate: 6, realRate: 2 },
    { inflation: 6, nominalRate: 8, realRate: 2 },
    { inflation: 8, nominalRate: 10, realRate: 2 },
  ];
  
  // ----- STATE MANAGEMENT -----
  // State for dynamic bond data
  const [bondData, setBondData] = useState(initialBondData);
  
  // State for interactive bond model
  const [expectedInflation, setExpectedInflation] = useState(2);
  const [wealthLevel, setWealthLevel] = useState(5);
  const [riskLevel, setRiskLevel] = useState(3);
  
  // ----- HELPER FUNCTIONS -----
  // Calculate shifts in bond supply/demand based on user inputs
  const calculateBondShift = () => {
    // Higher inflation shifts demand left and supply right
    const demandShift = -expectedInflation + wealthLevel - riskLevel;
    const supplyShift = expectedInflation;
    
    return {
      demandShift: demandShift > 0 ? `Right by ${demandShift}` : `Left by ${Math.abs(demandShift)}`,
      supplyShift: supplyShift > 0 ? `Right by ${supplyShift}` : `Left by ${Math.abs(supplyShift)}`,
      interestRateEffect: demandShift - supplyShift < 0 ? 'Increase' : 'Decrease'
    };
  };
  
  // ----- EFFECTS -----
  // Update bond data based on sliders
  useEffect(() => {
    // Calculate new data points based on user inputs
    const newBondData = initialBondData.map(item => {
      // Calculate adjustments based on user inputs
      const inflationEffect = -expectedInflation * 10;
      const wealthEffect = wealthLevel * 8;
      const riskEffect = -riskLevel * 7;
      
      // Combined adjustment factor
      const adjustmentFactor = inflationEffect + wealthEffect + riskEffect;
      
      // Adjust price (constrained to reasonable bounds)
      const newPrice = Math.max(500, Math.min(1100, item.price + adjustmentFactor));
      
      // Adjust interest rate inversely to price
      const baseRate = 10;
      const newInterest = baseRate * (1000/newPrice);
      
      return {
        ...item,
        price: Math.round(newPrice),
        interest: parseFloat(newInterest.toFixed(1))
      };
    });
    
    setBondData(newBondData);
  }, [expectedInflation, wealthLevel, riskLevel]);
  
  const bondResult = calculateBondShift();
  
  // ----- COMPONENT FRAGMENTS -----
  // Main Navigation Bar
  const renderMainNav = () => (
    <nav className="bg-blue-800 text-white py-3 px-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Economics</div>
        <div className="flex space-x-6">
          <button 
            className={`px-4 py-2 rounded transition ${mainCategory === 'finance' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            onClick={() => setMainCategory('finance')}
          >
            Financial Models
          </button>
          <button 
            className={`px-4 py-2 rounded transition ${mainCategory === 'games' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            onClick={() => setMainCategory('games')}
          >
            Economic Simulations
          </button>
          <button 
            className={`px-4 py-2 rounded transition ${mainCategory === 'analysis' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            onClick={() => setMainCategory('analysis')}
          >
            Analysis
          </button>
        </div>
      </div>
    </nav>
  );
  
  // Secondary Navigation Tabs - Finance
  const renderFinanceTabs = () => (
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${financeTab === 'bonds' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setFinanceTab('bonds')}
      >
        Bond Market Model
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${financeTab === 'money' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setFinanceTab('money')}
      >
        Money & Interest Rates
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${financeTab === 'financial' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setFinanceTab('financial')}
      >
        Financial System
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${financeTab === 'fisher' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setFinanceTab('fisher')}
      >
        Fisher Effect
      </button>
    </div>
  );
  
  // Secondary Navigation Tabs - Games
  const renderGameTabs = () => (
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${gameTab === 'beer' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setGameTab('beer')}
      >
        Beer Distribution Game
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${gameTab === 'tariff-sim' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setGameTab('tariff-sim')}
      >
        Tariff Simulator
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${gameTab === 'tariff-game' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setGameTab('tariff-game')}
      >
        Tariff Game
      </button>
    </div>
  );

  const renderAnalysisTabs = () => (
    <div className="flex justify-center gap-4 mb-6 flex-wrap">
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${analysisTab === 'fedfund' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setAnalysisTab('fedfund')}
      >
        FEDFUND
      </button>
      <button 
        className={`px-4 py-2 rounded-t border-b-2 transition ${gameTab === 'unemployment' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'}`}
        onClick={() => setAnalysisTab('unemployment')}
      >
        UNEMPLOYMENT
      </button>
    </div>
  );
  
  // Bond Market Visualization
  const renderBondMarket = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Supply and Demand in the Bond Market</h2>
      <p className="mb-4">Adjust the sliders to see how different factors affect bond markets.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <label className="block mb-2">Expected Inflation: {expectedInflation}%</label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={expectedInflation} 
              onChange={(e) => setExpectedInflation(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Wealth Level: {wealthLevel} (Higher = More Wealth)</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={wealthLevel} 
              onChange={(e) => setWealthLevel(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Risk Level: {riskLevel} (Higher = More Risk)</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={riskLevel} 
              onChange={(e) => setRiskLevel(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Market Effects:</h3>
            <p><strong>Demand Curve Shift:</strong> {bondResult.demandShift}</p>
            <p><strong>Supply Curve Shift:</strong> {bondResult.supplyShift}</p>
            <p><strong>Interest Rate:</strong> {bondResult.interestRateEffect}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Bond Prices vs. Interest Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bondData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quantity" label={{ value: 'Quantity of Bonds', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" domain={[500, 1100]} label={{ value: 'Price of Bonds', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 40]} label={{ value: 'Interest Rate (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="price" stroke="#2563eb" name="Bond Price" />
              <Line yAxisId="right" type="monotone" dataKey="interest" stroke="#dc2626" name="Interest Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-sm text-gray-600">Note the inverse relationship between bond prices and interest rates.</p>
        </div>
      </div>
    </div>
  );
  
  // Money & Interest Rates Visualization
  const renderMoneyInterestRates = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Money Growth and Interest Rates (1950-2020)</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={moneyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis yAxisId="left" label={{ value: 'Interest Rate (%)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'M2 Growth Rate (%)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="interestRate" stroke="#2563eb" name="Interest Rate (%)" />
          <Line yAxisId="right" type="monotone" dataKey="m2Growth" stroke="#10b981" name="M2 Growth Rate (%)" />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Key Insights from the Liquidity Preference Framework:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>When the central bank increases money supply, the initial effect (liquidity effect) is a decrease in interest rates.</li>
          <li>However, if increased money supply raises income or price levels, interest rates may eventually rise (income and price-level effects).</li>
          <li>If money growth leads to higher expected inflation, interest rates will rise further (expected-inflation effect).</li>
          <li>The relationship between money growth and interest rates depends on which effect dominates over time.</li>
        </ul>
      </div>
    </div>
  );
  
  // Financial System Visualization
  const renderFinancialSystem = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Financial Market Structure</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border p-4 rounded-lg bg-blue-50">
          <h3 className="font-semibold text-lg mb-3">Direct Finance</h3>
          <div className="flex flex-col items-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 w-40 text-center">
              Lender-Savers
            </div>
            <div className="h-8 w-0.5 bg-gray-400"></div>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4 w-40 text-center">
              Financial Markets
            </div>
            <div className="h-8 w-0.5 bg-gray-400"></div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-40 text-center">
              Borrower-Spenders
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Examples:</h4>
            <ul className="list-disc pl-5 mt-2">
              <li>Stock Market</li>
              <li>Bond Market</li>
              <li>Primary & Secondary Markets</li>
            </ul>
          </div>
        </div>
        
        <div className="border p-4 rounded-lg bg-red-50">
          <h3 className="font-semibold text-lg mb-3">Indirect Finance</h3>
          <div className="flex flex-col items-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 w-40 text-center">
              Lender-Savers
            </div>
            <div className="h-8 w-0.5 bg-gray-400"></div>
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 w-40 text-center">
              Financial Intermediaries
            </div>
            <div className="h-8 w-0.5 bg-gray-400"></div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 w-40 text-center">
              Borrower-Spenders
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Examples:</h4>
            <ul className="list-disc pl-5 mt-2">
              <li>Banks</li>
              <li>Credit Unions</li>
              <li>Insurance Companies</li>
              <li>Mutual Funds</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Benefits of Financial Intermediaries:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Lower Transaction Costs:</strong> Economies of scale and scope</li>
          <li><strong>Risk Sharing:</strong> Diversification across many investments</li>
          <li><strong>Information Management:</strong> Reducing adverse selection and moral hazard</li>
          <li><strong>Liquidity:</strong> Providing access to funds when needed</li>
        </ul>
      </div>
    </div>
  );
  
  // Fisher Effect Visualization
  const renderFisherEffect = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">The Fisher Effect</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fisherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="inflation" label={{ value: 'Expected Inflation Rate (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Interest Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nominalRate" stroke="#2563eb" name="Nominal Interest Rate" />
              <Line type="monotone" dataKey="realRate" stroke="#10b981" name="Real Interest Rate" />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-sm text-gray-600">Fisher Equation: r = i - πᵉ (real rate = nominal rate - expected inflation)</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">How Expected Inflation Affects Bond Markets:</h3>
          <div className="p-4 bg-gray-100 rounded-lg">
            <h4 className="font-medium mb-2">When Expected Inflation Rises:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bond demand curve shifts left (lower real returns)</li>
              <li>Bond supply curve shifts right (borrowers expect to repay in cheaper dollars)</li>
              <li>Result: Bond prices fall and interest rates rise</li>
            </ul>
            
            <h4 className="font-medium mt-4 mb-2">When Expected Inflation Falls:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bond demand curve shifts right (higher real returns)</li>
              <li>Bond supply curve shifts left (borrowers expect to repay in more valuable dollars)</li>
              <li>Result: Bond prices rise and interest rates fall</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Historical Evidence:</h4>
            <p>U.S. data from 1953-2020 shows a strong positive correlation between expected inflation and interest rates, supporting the Fisher effect theory.</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // ----- SIMULATION COMPONENTS -----
  // Beer Distribution Game
  const renderBeerGame = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Beer Distribution Game</h2>
      <p className="mb-4">Experience the bullwhip effect in supply chains through this interactive simulation.</p>
      <BeerDistributionGame />
    </div>
  );
  
  // Tariff Simulator
  const renderTariffSimulator = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tariff Policy Simulator</h2>
      <p className="mb-4">Explore how different tariff policies affect international trade outcomes.</p>
      <TariffSimulator />
    </div>
  );
  
  // Tariff Game
  const renderTariffGame = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Interactive Tariff Game</h2>
      <p className="mb-4">Play as a trade policy maker and see the consequences of your decisions.</p>
      <TariffGame />
    </div>
  );
  
  // ----- MAIN RENDER -----
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main Navigation */}
      {renderMainNav()}
      
      <div className="container mx-auto px-4 pb-12">
        {/* Financial Models Section */}
        {mainCategory === 'finance' && (
          <>
            {renderFinanceTabs()}
            {financeTab === 'bonds' && renderBondMarket()}
            {financeTab === 'money' && renderMoneyInterestRates()}
            {financeTab === 'financial' && renderFinancialSystem()}
            {financeTab === 'fisher' && renderFisherEffect()}
          </>
        )}
        
        {/* Economic Games Section */}
        {mainCategory === 'games' && (
          <>
            {renderGameTabs()}
            {gameTab === 'beer' && renderBeerGame()}
            {gameTab === 'tariff-sim' && renderTariffSimulator()}
            {gameTab === 'tariff-game' && renderTariffGame()}
          </>
        )}

        {mainCategory === 'analysis' && (
          <>
            {renderAnalysisTabs()}
            {analysisTab === 'fedfund'}
            {analysisTab === 'unemployment'}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;