import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TariffSimulator = () => {
  // State variables for tariff inputs
  const [tariffRate, setTariffRate] = useState(10); // Initial tariff rate percentage
  const [importElasticity, setImportElasticity] = useState(2); // Price elasticity of imports
  const [domesticElasticity, setDomesticElasticity] = useState(1.5); // Price elasticity of domestic production
  const [importShare, setImportShare] = useState(30); // Import share of domestic consumption (%)
  const [retaliationLevel, setRetaliationLevel] = useState(0); // Level of trade retaliation
  
  // Additional state for market factors
  const [globalSupplyChainIntegration, setGlobalSupplyChainIntegration] = useState(50); // 0-100 scale
  const [currencyStrength, setCurrencyStrength] = useState(50); // 0-100 scale
  
  // Initial market data
  const initialData = {
    price: 100,
    domesticSupply: 700,
    imports: 300,
    totalConsumption: 1000,
    tariffRevenue: 0,
    consumerSurplus: 1000,
    producerSurplus: 800,
    exportDemand: 400,
    inflation: 2.0,
    gdpGrowth: 2.5,
    unemployment: 5,
  };
  
  // Calculated effects state
  const [marketData, setMarketData] = useState(initialData);
  
  // Historic data for charts
  const [historicData, setHistoricData] = useState([
    { tariff: 0, price: 100, imports: 300, domestic: 700, inflation: 2.0, exportDemand: 400, gdpGrowth: 2.5 },
    { tariff: 5, price: 103, imports: 285, domestic: 710, inflation: 2.1, exportDemand: 390, gdpGrowth: 2.45 },
    { tariff: 10, price: 106, imports: 270, domestic: 720, inflation: 2.2, exportDemand: 380, gdpGrowth: 2.4 },
    { tariff: 15, price: 110, imports: 255, domestic: 730, inflation: 2.35, exportDemand: 365, gdpGrowth: 2.3 },
    { tariff: 20, price: 115, imports: 240, domestic: 740, inflation: 2.5, exportDemand: 350, gdpGrowth: 2.2 },
    { tariff: 25, price: 120, imports: 225, domestic: 750, inflation: 2.7, exportDemand: 330, gdpGrowth: 2.1 },
    { tariff: 30, price: 126, imports: 210, domestic: 760, inflation: 2.9, exportDemand: 310, gdpGrowth: 1.9 },
    { tariff: 35, price: 133, imports: 195, domestic: 765, inflation: 3.2, exportDemand: 290, gdpGrowth: 1.7 },
    { tariff: 40, price: 140, imports: 180, domestic: 770, inflation: 3.5, exportDemand: 270, gdpGrowth: 1.5 },
    { tariff: 45, price: 148, imports: 165, domestic: 775, inflation: 3.8, exportDemand: 250, gdpGrowth: 1.3 },
    { tariff: 50, price: 155, imports: 150, domestic: 780, inflation: 4.2, exportDemand: 230, gdpGrowth: 1.0 },
  ]);
  
  // Calculate effects when inputs change
  useEffect(() => {
    calculateTariffEffects();
  }, [tariffRate, importElasticity, domesticElasticity, importShare, retaliationLevel, globalSupplyChainIntegration, currencyStrength]);
  
  // Function to calculate tariff effects
  const calculateTariffEffects = () => {
    // Base price effect calculation (simplified model)
    const basePriceIncrease = tariffRate * (importShare / 100) * 0.8;
    
    // Adjustments for elasticities
    const elasticityFactor = (2 / (importElasticity + domesticElasticity));
    const adjustedPriceIncrease = basePriceIncrease * elasticityFactor;
    
    // Adjustments for global supply chain integration
    // Higher integration means more price pressure throughout economy
    const supplyChainFactor = 0.5 + (globalSupplyChainIntegration / 100);
    
    // Currency strength effect
    // Stronger currency reduces tariff price impact
    const currencyFactor = 1.5 - (currencyStrength / 100);
    
    // Retaliation effect on exports
    const retaliationFactor = 1 + (retaliationLevel / 50);
    
    // Calculate new price level
    const newPrice = Math.round(initialData.price * (1 + (adjustedPriceIncrease / 100) * supplyChainFactor * currencyFactor));
    
    // Calculate import quantity change based on price elasticity
    const importPctChange = -importElasticity * (adjustedPriceIncrease);
    const newImports = Math.max(0, Math.round(initialData.imports * (1 + importPctChange / 100)));
    
    // Calculate domestic supply change based on price elasticity
    const domesticPctChange = domesticElasticity * (adjustedPriceIncrease / 2);
    const newDomesticSupply = Math.round(initialData.domesticSupply * (1 + domesticPctChange / 100));
    
    // Calculate total consumption
    const newTotalConsumption = newImports + newDomesticSupply;
    
    // Calculate tariff revenue
    const tariffRevenue = newImports * (tariffRate / 100) * newPrice;
    
    // Consumer and producer surplus (simplified)
    const newConsumerSurplus = initialData.consumerSurplus * (initialData.price / newPrice) * (newTotalConsumption / initialData.totalConsumption);
    const newProducerSurplus = initialData.producerSurplus * (newPrice / initialData.price) * (newDomesticSupply / initialData.domesticSupply);
    
    // Export demand (affected by retaliation)
    const newExportDemand = Math.round(initialData.exportDemand * (1 - ((retaliationLevel * retaliationFactor) / 100)));
    
    // Inflation impact
    const inflationImpact = (adjustedPriceIncrease / 10) * supplyChainFactor * (importShare / 50);
    const newInflation = parseFloat((initialData.inflation + inflationImpact).toFixed(1));
    
    // GDP growth impact
    const tradeDamage = (importPctChange + (retaliationLevel * retaliationFactor)) / 200;
    const newGdpGrowth = parseFloat((initialData.gdpGrowth - tradeDamage).toFixed(1));
    
    // Unemployment impact (simplified)
    const employmentEffect = (domesticPctChange / 3) - (importPctChange / 6) - (retaliationLevel / 20);
    const newUnemployment = parseFloat((initialData.unemployment - employmentEffect / 10).toFixed(1));
    
    // Update market data state
    setMarketData({
      price: newPrice,
      domesticSupply: newDomesticSupply,
      imports: newImports,
      totalConsumption: newTotalConsumption,
      tariffRevenue: Math.round(tariffRevenue),
      consumerSurplus: Math.round(newConsumerSurplus),
      producerSurplus: Math.round(newProducerSurplus),
      exportDemand: newExportDemand,
      inflation: newInflation,
      gdpGrowth: newGdpGrowth,
      unemployment: newUnemployment,
    });
  };
  
  // Generate descriptive analysis of tariff impacts
  const generateAnalysis = () => {
    // Determine overall economic impact
    const gdpImpact = marketData.gdpGrowth < initialData.gdpGrowth ? "negative" : "positive";
    const inflationImpact = marketData.inflation > initialData.inflation ? "increased" : "decreased";
    const consumerImpact = marketData.consumerSurplus < initialData.consumerSurplus ? "worse off" : "better off";
    const producerImpact = marketData.producerSurplus > initialData.producerSurplus ? "benefiting" : "harmed";
    const govtRevenue = marketData.tariffRevenue > 0 ? "generating revenue" : "not significant";
    
    return {
      gdpImpact,
      inflationImpact,
      consumerImpact,
      producerImpact,
      govtRevenue,
    };
  };
  
  const analysis = generateAnalysis();
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Tariff Impact Simulator</h1>
      <p className="text-center mb-6">Adjust the sliders to see how tariffs affect various economic indicators</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Tariff Settings</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Tariff Rate: {tariffRate}%</label>
            <input 
              type="range" 
              min="0" 
              max="50" 
              value={tariffRate} 
              onChange={(e) => setTariffRate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>No Tariff</span>
              <span>High Tariff</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Import Price Elasticity: {importElasticity.toFixed(1)}</label>
            <input 
              type="range" 
              min="0.5" 
              max="4" 
              step="0.1"
              value={importElasticity} 
              onChange={(e) => setImportElasticity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Inelastic</span>
              <span>Elastic</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Domestic Supply Elasticity: {domesticElasticity.toFixed(1)}</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1"
              value={domesticElasticity} 
              onChange={(e) => setDomesticElasticity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Inelastic</span>
              <span>Elastic</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Import Share of Market: {importShare}%</label>
            <input 
              type="range" 
              min="5" 
              max="80" 
              value={importShare} 
              onChange={(e) => setImportShare(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low Imports</span>
              <span>High Imports</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Trade Retaliation Level: {retaliationLevel}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={retaliationLevel} 
              onChange={(e) => setRetaliationLevel(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>No Retaliation</span>
              <span>Full Retaliation</span>
            </div>
          </div>
          
          <h3 className="font-medium mt-6 mb-2">Advanced Settings</h3>
          
          <div className="mb-4">
            <label className="block mb-2">Global Supply Chain Integration: {globalSupplyChainIntegration}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={globalSupplyChainIntegration} 
              onChange={(e) => setGlobalSupplyChainIntegration(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Currency Strength: {currencyStrength}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={currencyStrength} 
              onChange={(e) => setCurrencyStrength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <h2 className="text-lg font-semibold mb-4">Economic Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <h3 className="font-medium text-sm text-blue-800">Price Level</h3>
              <p className="text-2xl font-bold">{marketData.price}</p>
              <p className="text-xs text-gray-500">Base: 100</p>
            </div>
            
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <h3 className="font-medium text-sm text-red-800">Inflation</h3>
              <p className="text-2xl font-bold">{marketData.inflation}%</p>
              <p className="text-xs text-gray-500">Base: 2.0%</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <h3 className="font-medium text-sm text-green-800">GDP Growth</h3>
              <p className="text-2xl font-bold">{marketData.gdpGrowth}%</p>
              <p className="text-xs text-gray-500">Base: 2.5%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium mb-2">Market Composition</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Before Tariff', domestic: initialData.domesticSupply, imports: initialData.imports },
                  { name: 'After Tariff', domestic: marketData.domesticSupply, imports: marketData.imports }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="domestic" name="Domestic Supply" fill="#4f46e5" />
                  <Bar dataKey="imports" name="Imports" fill="#e11d48" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Welfare Effects</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { 
                    name: 'Before', 
                    consumer: initialData.consumerSurplus, 
                    producer: initialData.producerSurplus,
                    government: initialData.tariffRevenue
                  },
                  { 
                    name: 'After', 
                    consumer: marketData.consumerSurplus, 
                    producer: marketData.producerSurplus,
                    government: marketData.tariffRevenue
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumer" name="Consumer Surplus" fill="#3b82f6" />
                  <Bar dataKey="producer" name="Producer Surplus" fill="#10b981" />
                  <Bar dataKey="government" name="Tariff Revenue" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Historic Tariff Rate Effects</h3>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={historicData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tariff" label={{ value: 'Tariff Rate (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: 'Price Index', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Quantities', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="price" name="Price Level" stroke="#8b5cf6" />
                <Line yAxisId="right" type="monotone" dataKey="imports" name="Import Quantity" stroke="#ef4444" />
                <Line yAxisId="right" type="monotone" dataKey="domestic" name="Domestic Production" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-medium mb-2">Economic Analysis</h3>
            <p className="mb-2">
              A {tariffRate}% tariff with {retaliationLevel}% retaliation from trading partners would have a {analysis.gdpImpact} impact on overall GDP growth ({marketData.gdpGrowth}% vs base of 2.5%).
            </p>
            <p className="mb-2">
              Inflation would be {analysis.inflationImpact} to {marketData.inflation}%, while domestic producers are {analysis.producerImpact} and consumers are {analysis.consumerImpact}.
            </p>
            <p>
              Government is {analysis.govtRevenue} (${marketData.tariffRevenue}), but export demand has fallen to {marketData.exportDemand} units (from 400).
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">About Tariffs</h2>
        <p className="mb-3">
          Tariffs are taxes imposed by a government on imported goods, generally aiming to protect domestic industries from foreign competition. While they can help domestic producers, tariffs often lead to higher prices for consumers and may trigger retaliatory measures from trading partners.
        </p>
        <h3 className="font-medium mb-1">Key Economic Effects:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Higher domestic prices for both imported and competing domestic goods</li>
          <li>Increased domestic production in protected industries</li>
          <li>Reduced import quantities</li>
          <li>Government revenue from tariff collection</li>
          <li>Potential retaliation from trading partners against exports</li>
          <li>Deadweight loss from market inefficiency</li>
          <li>Inflationary pressure throughout the economy</li>
        </ul>
      </div>
    </div>
  );
};

export default TariffSimulator;