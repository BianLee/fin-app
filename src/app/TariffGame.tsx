"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TariffGame = () => {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [maxTurns, setMaxTurns] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  
  // Player economy stats
  const [playerEconomy, setPlayerEconomy] = useState({
    gdp: 100,
    inflation: 2.0,
    unemployment: 5.0,
    tradeBalance: 0,
    tariffRate: 5.0
  });

  // AI economy stats
  const [aiEconomy, setAiEconomy] = useState({
    gdp: 100,
    inflation: 2.0,
    unemployment: 5.0,
    tradeBalance: 0,
    tariffRate: 5.0
  });

  // Action state
  const [selectedAction, setSelectedAction] = useState('none');
  const [tariffChangeAmount, setTariffChangeAmount] = useState(5);
  const [subsidyAmount, setSubsidyAmount] = useState(10);
  const [turnHistory, setTurnHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // AI behavior type
  const [aiType, setAiType] = useState('balanced');

  // Game initialization
  const startGame = () => {
    setGameActive(true);
    setGameOver(false);
    setCurrentTurn(1);
    setTurnHistory([]);
    
    // Reset economies
    setPlayerEconomy({
      gdp: 100,
      inflation: 2.0,
      unemployment: 5.0,
      tradeBalance: 0,
      tariffRate: 5.0
    });
    
    setAiEconomy({
      gdp: 100,
      inflation: 2.0,
      unemployment: 5.0,
      tradeBalance: 0,
      tariffRate: 5.0
    });
  };

  // AI decision making
  const getAIAction = () => {
    let action = { type: 'none', amount: 0 };
    
    switch(aiType) {
      case 'aggressive':
        // AI always retaliates harder
        if (selectedAction === 'raiseTariff') {
          action = { type: 'raiseTariff', amount: tariffChangeAmount * 1.5 };
        } else if (selectedAction === 'lowerTariff') {
          action = { 
            type: Math.random() > 0.7 ? 'lowerTariff' : 'none', 
            amount: tariffChangeAmount * 0.8 
          };
        } else if (selectedAction === 'subsidize') {
          action = { type: 'raiseTariff', amount: 5 };
        }
        break;
        
      case 'defensive':
        // AI mostly reacts only when hurt
        if (aiEconomy.gdp < aiEconomy.gdp * 0.98) {
          action = { type: 'raiseTariff', amount: 5 + Math.floor(Math.random() * 5) };
        } else if (playerEconomy.tariffRate > 15 && Math.random() > 0.5) {
          action = { type: 'raiseTariff', amount: 3 + Math.floor(Math.random() * 5) };
        } else if (playerEconomy.tariffRate < 3 && Math.random() > 0.7) {
          action = { type: 'lowerTariff', amount: 2 };
        }
        break;
        
      case 'negotiator':
        // More likely to propose deals
        if (selectedAction === 'raiseTariff' && Math.random() > 0.6) {
          action = { type: 'raiseTariff', amount: tariffChangeAmount * 0.5 };
        } else if (selectedAction === 'lowerTariff') {
          action = { type: 'lowerTariff', amount: tariffChangeAmount * 1.2 };
        } else if (currentTurn % 3 === 0) {
          // Occasionally proposes compromise
          action = { 
            type: playerEconomy.tariffRate > 10 ? 'lowerTariff' : 'none', 
            amount: 3 
          };
        }
        break;
        
      default: // balanced
        // Mix of strategies
        if (selectedAction === 'raiseTariff' && Math.random() > 0.3) {
          action = { type: 'raiseTariff', amount: tariffChangeAmount * 0.8 };
        } else if (selectedAction === 'lowerTariff' && Math.random() > 0.5) {
          action = { type: 'lowerTariff', amount: tariffChangeAmount * 0.9 };
        } else if (Math.random() > 0.8) {
          action = { type: 'subsidize', amount: 5 + Math.floor(Math.random() * 10) };
        }
    }
    
    return action;
  };

  // Calculate effect of tariff actions on economies
  const calculateEconomicEffects = (playerAction, aiAction) => {
    // Copy current state
    const newPlayerEconomy = { ...playerEconomy };
    const newAiEconomy = { ...aiEconomy };
    
    // Base growth rate (random element)
    const baseGrowthRate = 2 + (Math.random() * 1.5 - 0.75);
    
    // Process player action
    if (playerAction === 'raiseTariff') {
      // Increase tariff rate
      newPlayerEconomy.tariffRate += tariffChangeAmount;
      
      // Protect domestic industry (boost GDP slightly)
      newPlayerEconomy.gdp += 0.5;
      
      // But raise inflation and reduce trade
      newPlayerEconomy.inflation += tariffChangeAmount * 0.15;
      newPlayerEconomy.tradeBalance -= tariffChangeAmount * 0.2;
      
      // Affect AI economy
      newAiEconomy.gdp -= tariffChangeAmount * 0.3;
      newAiEconomy.tradeBalance += tariffChangeAmount * 0.1;
    } 
    else if (playerAction === 'lowerTariff') {
      // Decrease tariff rate
      newPlayerEconomy.tariffRate -= tariffChangeAmount;
      newPlayerEconomy.tariffRate = Math.max(0, newPlayerEconomy.tariffRate);
      
      // Reduce inflation, increase trade, but potential domestic impact
      newPlayerEconomy.inflation -= tariffChangeAmount * 0.1;
      newPlayerEconomy.tradeBalance += tariffChangeAmount * 0.3;
      newPlayerEconomy.unemployment += tariffChangeAmount * 0.1;
      
      // Affect AI economy
      newAiEconomy.gdp += tariffChangeAmount * 0.2;
      newAiEconomy.tradeBalance -= tariffChangeAmount * 0.2;
    }
    else if (playerAction === 'subsidize') {
      // Subsidize domestic industry
      newPlayerEconomy.gdp += subsidyAmount * 0.3;
      newPlayerEconomy.unemployment -= subsidyAmount * 0.1;
      
      // But increase inflation slightly
      newPlayerEconomy.inflation += subsidyAmount * 0.05;
    }
    
    // Process AI action
    if (aiAction.type === 'raiseTariff') {
      // AI raises tariffs
      newAiEconomy.tariffRate += aiAction.amount;
      
      // AI economy effects
      newAiEconomy.gdp += 0.5;
      newAiEconomy.inflation += aiAction.amount * 0.15;
      newAiEconomy.tradeBalance -= aiAction.amount * 0.2;
      
      // Effect on player economy
      newPlayerEconomy.gdp -= aiAction.amount * 0.3;
      newPlayerEconomy.tradeBalance += aiAction.amount * 0.1;
    } 
    else if (aiAction.type === 'lowerTariff') {
      // AI lowers tariffs
      newAiEconomy.tariffRate -= aiAction.amount;
      newAiEconomy.tariffRate = Math.max(0, newAiEconomy.tariffRate);
      
      // AI economy effects
      newAiEconomy.inflation -= aiAction.amount * 0.1;
      newAiEconomy.tradeBalance += aiAction.amount * 0.3;
      newAiEconomy.unemployment += aiAction.amount * 0.1;
      
      // Effect on player economy
      newPlayerEconomy.gdp += aiAction.amount * 0.2;
      newPlayerEconomy.tradeBalance -= aiAction.amount * 0.2;
    }
    else if (aiAction.type === 'subsidize') {
      // AI subsidizes domestic industry
      newAiEconomy.gdp += aiAction.amount * 0.3;
      newAiEconomy.unemployment -= aiAction.amount * 0.1;
      newAiEconomy.inflation += aiAction.amount * 0.05;
    }
    
    // Apply base growth (with randomness)
    newPlayerEconomy.gdp += baseGrowthRate;
    newAiEconomy.gdp += baseGrowthRate;
    
    // Trade war effects if both sides have high tariffs
    if (newPlayerEconomy.tariffRate > 20 && newAiEconomy.tariffRate > 20) {
      newPlayerEconomy.gdp -= 1.5;
      newAiEconomy.gdp -= 1.5;
      newPlayerEconomy.inflation += 0.5;
      newAiEconomy.inflation += 0.5;
    }
    
    // Keep inflation in reasonable bounds
    newPlayerEconomy.inflation = Math.max(0, Math.min(15, newPlayerEconomy.inflation));
    newAiEconomy.inflation = Math.max(0, Math.min(15, newAiEconomy.inflation));
    
    // Keep unemployment in reasonable bounds
    newPlayerEconomy.unemployment = Math.max(2, Math.min(15, newPlayerEconomy.unemployment));
    newAiEconomy.unemployment = Math.max(2, Math.min(15, newAiEconomy.unemployment));
    
    return { newPlayerEconomy, newAiEconomy };
  };

  // Process one turn
  const executeTurn = () => {
    if (!gameActive || gameOver) return;
    
    // Get AI action
    const aiAction = getAIAction();
    
    // Calculate effects
    const { newPlayerEconomy, newAiEconomy } = calculateEconomicEffects(selectedAction, aiAction);
    
    // Add to history
    const historyEntry = {
      turn: currentTurn,
      playerAction: selectedAction,
      playerTariffChange: selectedAction === 'raiseTariff' ? `+${tariffChangeAmount}%` : 
                          selectedAction === 'lowerTariff' ? `-${tariffChangeAmount}%` : 'N/A',
      playerSubsidy: selectedAction === 'subsidize' ? `$${subsidyAmount}B` : 'N/A',
      aiAction: aiAction.type,
      aiTariffChange: aiAction.type === 'raiseTariff' ? `+${aiAction.amount}%` : 
                      aiAction.type === 'lowerTariff' ? `-${aiAction.amount}%` : 'N/A',
      aiSubsidy: aiAction.type === 'subsidize' ? `$${aiAction.amount}B` : 'N/A',
      playerGdpGrowth: (newPlayerEconomy.gdp - playerEconomy.gdp).toFixed(1),
      aiGdpGrowth: (newAiEconomy.gdp - aiEconomy.gdp).toFixed(1)
    };
    
    setTurnHistory([...turnHistory, historyEntry]);
    
    // Update state
    setPlayerEconomy(newPlayerEconomy);
    setAiEconomy(newAiEconomy);
    setCurrentTurn(currentTurn + 1);
    
    // Reset action for next turn
    setSelectedAction('none');
    
    // Check for game end
    if (currentTurn >= maxTurns) {
      endGame();
    }
  };

   // Generate data for the chart
   const getChartData = () => {
    return turnHistory.map((entry, index) => ({
      turn: entry.turn,
      playerGDP: playerEconomy.gdp - (turnHistory.length - index),
      aiGDP: aiEconomy.gdp - (turnHistory.length - index),
      playerTariff: playerEconomy.tariffRate - (turnHistory.length - index),
      aiTariff: aiEconomy.tariffRate - (turnHistory.length - index),
    }));
  };

  // End game and determine winner
  const endGame = () => {
    setGameOver(true);
    setGameActive(false);
    
    // Calculate final score
    const playerScore = playerEconomy.gdp - (playerEconomy.inflation * 1.5) - (playerEconomy.unemployment * 2);
    const aiScore = aiEconomy.gdp - (aiEconomy.inflation * 1.5) - (aiEconomy.unemployment * 2);
    
    let result;
    if (playerScore > aiScore) {
      result = {
        winner: 'player',
        message: `You win! Your economy outperformed the AI with a score of ${playerScore.toFixed(1)} to ${aiScore.toFixed(1)}.`
      };
    } else if (aiScore > playerScore) {
      result = {
        winner: 'ai',
        message: `The AI wins with a score of ${aiScore.toFixed(1)} to ${playerScore.toFixed(1)}. Try again!`
      };
    } else {
      result = {
        winner: 'tie',
        message: `It's a tie! Both economies scored ${playerScore.toFixed(1)}.`
      };
    }
    
    setGameResult(result);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Tariff Tug-of-War</h2>
      
      {!gameActive && !gameOver && (
        <div className="mb-6">
          <p className="mb-4">
            Welcome to Tariff Tug-of-War! You'll be competing against an AI to grow your economy through strategic tariff and subsidy decisions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2">Number of Turns:</label>
              <input 
                type="range" 
                min="5" 
                max="20" 
                value={maxTurns} 
                onChange={(e) => setMaxTurns(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center">{maxTurns}</div>
            </div>
            
            <div>
              <label className="block mb-2">AI Behavior:</label>
              <select 
                className="w-full p-2 border rounded" 
                value={aiType} 
                onChange={(e) => setAiType(e.target.value)}
              >
                <option value="aggressive">Aggressive (Retaliates Harder)</option>
                <option value="defensive">Defensive (Reacts When Hurt)</option>
                <option value="negotiator">Negotiator (Seeks Balance)</option>
                <option value="balanced">Balanced (Mixed Strategy)</option>
              </select>
            </div>
          </div>
          
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameActive && (
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Turn {currentTurn} of {maxTurns}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Your Economy</h4>
                <div className="space-y-1">
                  <p>GDP: <span className="font-semibold">{playerEconomy.gdp.toFixed(1)}</span></p>
                  <p>Inflation: <span className="font-semibold">{playerEconomy.inflation.toFixed(1)}%</span></p>
                  <p>Unemployment: <span className="font-semibold">{playerEconomy.unemployment.toFixed(1)}%</span></p>
                  <p>Trade Balance: <span className="font-semibold">{playerEconomy.tradeBalance.toFixed(1)}</span></p>
                  <p>Current Tariff Rate: <span className="font-semibold">{playerEconomy.tariffRate.toFixed(1)}%</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">AI Economy</h4>
                <div className="space-y-1">
                  <p>GDP: <span className="font-semibold">{aiEconomy.gdp.toFixed(1)}</span></p>
                  <p>Inflation: <span className="font-semibold">{aiEconomy.inflation.toFixed(1)}%</span></p>
                  <p>Unemployment: <span className="font-semibold">{aiEconomy.unemployment.toFixed(1)}%</span></p>
                  <p>Trade Balance: <span className="font-semibold">{aiEconomy.tradeBalance.toFixed(1)}</span></p>
                  <p>Current Tariff Rate: <span className="font-semibold">{aiEconomy.tariffRate.toFixed(1)}%</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Your Action</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="action" 
                    value="raiseTariff" 
                    checked={selectedAction === 'raiseTariff'} 
                    onChange={() => setSelectedAction('raiseTariff')}
                    className="mr-2"
                  />
                  Raise Tariff
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="action" 
                    value="lowerTariff" 
                    checked={selectedAction === 'lowerTariff'} 
                    onChange={() => setSelectedAction('lowerTariff')}
                    className="mr-2"
                  />
                  Lower Tariff
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="action" 
                    value="subsidize" 
                    checked={selectedAction === 'subsidize'} 
                    onChange={() => setSelectedAction('subsidize')}
                    className="mr-2"
                  />
                  Subsidize Industry
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="action" 
                    value="none" 
                    checked={selectedAction === 'none'} 
                    onChange={() => setSelectedAction('none')}
                    className="mr-2"
                  />
                  No Action
                </label>
              </div>
            </div>
            
            {selectedAction === 'raiseTariff' || selectedAction === 'lowerTariff' ? (
              <div className="mb-4">
                <label className="block mb-2">Tariff Change Amount: {tariffChangeAmount}%</label>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  value={tariffChangeAmount} 
                  onChange={(e) => setTariffChangeAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ) : selectedAction === 'subsidize' ? (
              <div className="mb-4">
                <label className="block mb-2">Subsidy Amount: ${subsidyAmount}B</label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={subsidyAmount} 
                  onChange={(e) => setSubsidyAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ) : null}
            
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={executeTurn}
              disabled={selectedAction === 'none'}
            >
              Execute Turn
            </button>
          </div>
          
          {turnHistory.length > 0 && (
            <div>
              <button 
                className="text-blue-600 underline mb-2"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
              
              {showHistory && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2">Turn</th>
                        <th className="p-2">Your Action</th>
                        <th className="p-2">AI Action</th>
                        <th className="p-2">Your GDP Growth</th>
                        <th className="p-2">AI GDP Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnHistory.map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                          <td className="p-2">{entry.turn}</td>
                          <td className="p-2">
                            {entry.playerAction === 'raiseTariff' ? `Raise Tariff ${entry.playerTariffChange}` : 
                             entry.playerAction === 'lowerTariff' ? `Lower Tariff ${entry.playerTariffChange}` :
                             entry.playerAction === 'subsidize' ? `Subsidize ${entry.playerSubsidy}` : 'No Action'}
                          </td>
                          <td className="p-2">
                            {entry.aiAction === 'raiseTariff' ? `Raise Tariff ${entry.aiTariffChange}` : 
                             entry.aiAction === 'lowerTariff' ? `Lower Tariff ${entry.aiTariffChange}` :
                             entry.aiAction === 'subsidize' ? `Subsidize ${entry.aiSubsidy}` : 'No Action'}
                          </td>
                          <td className="p-2">{entry.playerGdpGrowth}</td>
                          <td className="p-2">{entry.aiGdpGrowth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {turnHistory.length >= 3 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Economic Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="turn" />
                      <YAxis yAxisId="left" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="playerGDP" name="Your GDP" stroke="#2563eb" />
                      <Line yAxisId="left" type="monotone" dataKey="aiGDP" name="AI GDP" stroke="#dc2626" />
                      <Line yAxisId="left" type="monotone" dataKey="playerTariff" name="Your Tariff Rate" stroke="#10b981" />
                      <Line yAxisId="left" type="monotone" dataKey="aiTariff" name="AI Tariff Rate" stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {gameOver && gameResult && (
        <div className="mb-6">
          <div className={`p-4 rounded-lg mb-4 ${
            gameResult.winner === 'player' ? 'bg-green-100 border border-green-300' : 
            gameResult.winner === 'ai' ? 'bg-red-100 border border-red-300' : 
            'bg-yellow-100 border border-yellow-300'
          }`}>
            <h3 className="font-semibold mb-2">Game Over</h3>
            <p className="mb-2">{gameResult.message}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Your Final Economy</h4>
                <div className="space-y-1">
                  <p>GDP: <span className="font-semibold">{playerEconomy.gdp.toFixed(1)}</span></p>
                  <p>Inflation: <span className="font-semibold">{playerEconomy.inflation.toFixed(1)}%</span></p>
                  <p>Unemployment: <span className="font-semibold">{playerEconomy.unemployment.toFixed(1)}%</span></p>
                  <p>Trade Balance: <span className="font-semibold">{playerEconomy.tradeBalance.toFixed(1)}</span></p>
                  <p>Final Tariff Rate: <span className="font-semibold">{playerEconomy.tariffRate.toFixed(1)}%</span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">AI Final Economy</h4>
                <div className="space-y-1">
                  <p>GDP: <span className="font-semibold">{aiEconomy.gdp.toFixed(1)}</span></p>
                  <p>Inflation: <span className="font-semibold">{aiEconomy.inflation.toFixed(1)}%</span></p>
                  <p>Unemployment: <span className="font-semibold">{aiEconomy.unemployment.toFixed(1)}%</span></p>
                  <p>Trade Balance: <span className="font-semibold">{aiEconomy.tradeBalance.toFixed(1)}</span></p>
                  <p>Final Tariff Rate: <span className="font-semibold">{aiEconomy.tariffRate.toFixed(1)}%</span></p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Lessons Learned:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Raising tariffs can protect domestic industries but often leads to inflation and retaliation.</li>
                <li>Lowering tariffs can reduce prices for consumers but may harm some domestic industries.</li>
                <li>Subsidies can boost specific sectors but come at a fiscal cost.</li>
                <li>Extreme tariff wars typically hurt both economies.</li>
              </ul>
            </div>
          </div>
          
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={startGame}
          >
            Play Again
          </button>
        </div>
      )}
      
      {/* Game explanation section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold mb-2">About Tariff Tug-of-War</h3>
        <p className="mb-2">
          This simulation demonstrates the economic impacts of trade policies. The game simplifies complex economic relationships but illustrates key concepts:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The short-term protective effects of tariffs on domestic industries</li>
          <li>The potential for trade retaliation and escalation</li>
          <li>The trade-offs between protectionism and free trade</li>
          <li>The relationship between trade policies and key economic indicators</li>
        </ul>
      </div>
    </div>
  );
};

export default TariffGame;