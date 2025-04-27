"use client"
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPlay, FiRefreshCw, FiBarChart2, FiInfo } from 'react-icons/fi';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <h1 className="text-3xl font-bold">Global Trade Simulator</h1>
            <p className="opacity-90 mt-1">Master the economics of international trade policies</p>
          </div>

          {!gameActive && !gameOver && (
            <div className="p-6 md:p-8">
              <div className="max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                  <h2 className="text-xl font-semibold text-blue-800 mb-3">Welcome to Trade Wars</h2>
                  <p className="text-gray-700 mb-4">
                    Compete against an AI opponent in this economic strategy game. Make tariff and subsidy decisions to grow your economy while managing inflation and unemployment.
                  </p>
                  <div className="flex items-center text-blue-600">
                    <FiInfo className="mr-2" />
                    <span className="text-sm">10 turns • 4 AI difficulty levels • Real-time feedback</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-3">Game Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Turns</label>
                        <input 
                          type="range" 
                          min={0}
                          max={20}
                          value={maxTurns}
                          onChange={(e) => setMaxTurns(Number(e.target.value))}
                          className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Short ({0})</span>
                          <span className="font-medium text-blue-600">{maxTurns} turns</span>
                          <span>Long ({20})</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AI Difficulty</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={aiType}
                          onChange={(e) => setAiType(e.target.value as AIBehavior)}
                        >
                          <option value="balanced">Balanced</option>
                          <option value="aggressive">Aggressive</option>
                          <option value="defensive">Defensive</option>
                          <option value="negotiator">Negotiator</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-3">Quick Tutorial</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="inline-block bg-blue-100 text-blue-800 rounded-full p-1 mr-2">
                          <FiBarChart2 size={12} />
                        </span>
                        <span>Raise tariffs to protect domestic industries</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block bg-green-100 text-green-800 rounded-full p-1 mr-2">
                          <FiBarChart2 size={12} />
                        </span>
                        <span>Lower tariffs to boost trade and reduce prices</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block bg-purple-100 text-purple-800 rounded-full p-1 mr-2">
                          <FiBarChart2 size={12} />
                        </span>
                        <span>Subsidize key industries to stimulate growth</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition duration-150 ease-in-out"
                >
                  <FiPlay className="mr-2" />
                  Start New Game
                </button>
              </div>
            </div>
          )}

          {gameActive && (
            <div className="p-6 md:p-8">
              {/* Turn indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">Turn {currentTurn} of {maxTurns}</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {aiType === 'balanced' ? 'Balanced AI' : `${aiType.charAt(0).toUpperCase() + aiType.slice(1)} AI`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(currentTurn / maxTurns) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Economy dashboards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Player economy */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Your Economy</h3>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded">Player</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                      label="GDP" 
                      value={playerEconomy.gdp.toFixed(1)} 
                      change={parseFloat(turnHistory[turnHistory.length - 1]?.playerGdpGrowth || '0')}
                      icon={<TrendIcon value={parseFloat(turnHistory[turnHistory.length - 1]?.playerGdpGrowth || '0')} />}
                    />
                    <StatCard 
                      label="Inflation" 
                      value={`${playerEconomy.inflation.toFixed(1)}%`} 
                      isDanger={playerEconomy.inflation > 5}
                    />
                    <StatCard 
                      label="Unemployment" 
                      value={`${playerEconomy.unemployment.toFixed(1)}%`} 
                      isDanger={playerEconomy.unemployment > 8}
                    />
                    <StatCard 
                      label="Tariff Rate" 
                      value={`${playerEconomy.tariffRate.toFixed(1)}%`}
                    />
                  </div>
                </div>

                {/* AI economy */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-800">Opponent Economy</h3>
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded">AI</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                      label="GDP" 
                      value={aiEconomy.gdp.toFixed(1)} 
                      change={parseFloat(turnHistory[turnHistory.length - 1]?.aiGdpGrowth || '0')}
                      icon={<TrendIcon value={parseFloat(turnHistory[turnHistory.length - 1]?.aiGdpGrowth || '0')} />}
                    />
                    <StatCard 
                      label="Inflation" 
                      value={`${aiEconomy.inflation.toFixed(1)}%`} 
                      isDanger={aiEconomy.inflation > 5}
                    />
                    <StatCard 
                      label="Unemployment" 
                      value={`${aiEconomy.unemployment.toFixed(1)}%`} 
                      isDanger={aiEconomy.unemployment > 8}
                    />
                    <StatCard 
                      label="Tariff Rate" 
                      value={`${aiEconomy.tariffRate.toFixed(1)}%`}
                    />
                  </div>
                </div>
              </div>

              {/* Action panel */}
              <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Trade Policy Decision</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <ActionButton
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                    title="Raise Tariffs"
                    description="Protect domestic industries"
                    active={selectedAction === 'raiseTariff'}
                    onClick={() => setSelectedAction('raiseTariff')}
                    color="blue"
                  />
                  <ActionButton
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                    title="Lower Tariffs"
                    description="Boost international trade"
                    active={selectedAction === 'lowerTariff'}
                    onClick={() => setSelectedAction('lowerTariff')}
                    color="green"
                  />
                  <ActionButton
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Subsidize"
                    description="Stimulate key sectors"
                    active={selectedAction === 'subsidize'}
                    onClick={() => setSelectedAction('subsidize')}
                    color="purple"
                  />
                  <ActionButton
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>}
                    title="No Action"
                    description="Maintain current policies"
                    active={selectedAction === 'none'}
                    onClick={() => setSelectedAction('none')}
                    color="gray"
                  />
                </div>

                {selectedAction !== 'none' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    {selectedAction === 'raiseTariff' || selectedAction === 'lowerTariff' ? (
                      <>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {selectedAction === 'raiseTariff' ? 'Tariff Increase Amount' : 'Tariff Reduction Amount'}
                        </h4>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="1"
                            max="15"
                            value={tariffChangeAmount}
                            onChange={(e) => setTariffChangeAmount(Number(e.target.value))}
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-lg font-medium text-blue-600 min-w-[50px]">
                            {selectedAction === 'raiseTariff' ? '+' : '-'}{tariffChangeAmount}%
                          </span>
                        </div>
                      </>
                    ) : selectedAction === 'subsidize' ? (
                      <>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subsidy Amount</h4>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={subsidyAmount}
                            onChange={(e) => setSubsidyAmount(Number(e.target.value))}
                            className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-lg font-medium text-purple-600 min-w-[50px]">
                            ${subsidyAmount}B
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={executeTurn}
                    disabled={selectedAction === 'none'}
                    className={`px-6 py-3 rounded-md font-medium text-white shadow-sm transition duration-150 ease-in-out ${
                      selectedAction === 'none' 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Execute Policy Decision
                  </button>
                </div>
              </div>

              {/* History and charts */}
              <div className="space-y-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className={`w-4 h-4 mr-2 transition-transform ${showHistory ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showHistory ? 'Hide Turn History' : 'Show Turn History'}
                </button>

                {showHistory && (
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your GDP Δ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI GDP Δ</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {turnHistory.map((entry, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.turn}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <ActionBadge action={entry.playerAction} value={entry.playerAction === 'raiseTariff' || entry.playerAction === 'lowerTariff' ? entry.playerTariffChange : entry.playerSubsidy} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <ActionBadge action={entry.aiAction} value={entry.aiAction === 'raiseTariff' || entry.aiAction === 'lowerTariff' ? entry.aiTariffChange : entry.aiSubsidy} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <GrowthBadge value={parseFloat(entry.playerGdpGrowth)} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <GrowthBadge value={parseFloat(entry.aiGdpGrowth)} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {turnHistory.length >= 3 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Economic Trends</h3>
                    <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="turn" stroke="#6b7280" />
                        
                        {/* Define Y axis with yAxisId="left" */}
                        <YAxis stroke="#6b7280" yAxisId="left" domain={['auto', 'auto']}/>
                        
                        <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        }}
                        />
                        <Legend />
                        
                        {/* Line components using yAxisId="left" */}
                        <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="playerGDP"
                        name="Your GDP"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        />
                        <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="aiGDP"
                        name="AI GDP"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {gameOver && gameResult && (
            <div className="p-6 md:p-8">
              <div className={`rounded-xl p-6 mb-8 border ${
                gameResult.winner === 'player' 
                  ? 'bg-blue-50 border-blue-200' 
                  : gameResult.winner === 'ai' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {gameResult.winner === 'player' ? 'Victory!' : gameResult.winner === 'ai' ? 'Defeat' : 'Draw'}
                  </h2>
                  <p className="text-gray-700 max-w-2xl mx-auto">{gameResult.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Final Economy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FinalStatCard label="GDP" value={playerEconomy.gdp.toFixed(1)} isGood={playerEconomy.gdp > aiEconomy.gdp} />
                      <FinalStatCard label="Inflation" value={`${playerEconomy.inflation.toFixed(1)}%`} isGood={playerEconomy.inflation < aiEconomy.inflation} />
                      <FinalStatCard label="Unemployment" value={`${playerEconomy.unemployment.toFixed(1)}%`} isGood={playerEconomy.unemployment < aiEconomy.unemployment} />
                      <FinalStatCard label="Tariff Rate" value={`${playerEconomy.tariffRate.toFixed(1)}%`} />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Final Economy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FinalStatCard label="GDP" value={aiEconomy.gdp.toFixed(1)} isGood={aiEconomy.gdp > playerEconomy.gdp} />
                      <FinalStatCard label="Inflation" value={`${aiEconomy.inflation.toFixed(1)}%`} isGood={aiEconomy.inflation < playerEconomy.inflation} />
                      <FinalStatCard label="Unemployment" value={`${aiEconomy.unemployment.toFixed(1)}%`} isGood={aiEconomy.unemployment < playerEconomy.unemployment} />
                      <FinalStatCard label="Tariff Rate" value={`${aiEconomy.tariffRate.toFixed(1)}%`} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Takeaways</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className={`flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full mr-3 ${
                        playerEconomy.tariffRate > 20 && aiEconomy.tariffRate > 20 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {playerEconomy.tariffRate > 20 && aiEconomy.tariffRate > 20 ? '⚠️' : '📊'}
                      </span>
                      <span className="text-gray-700">
                        {playerEconomy.tariffRate > 20 && aiEconomy.tariffRate > 20 
                          ? 'Trade wars hurt both economies - both had very high tariffs' 
                          : 'Tariff strategy impacted economic outcomes'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-800 mr-3">
                        {playerEconomy.gdp > aiEconomy.gdp ? '🏆' : '📈'}
                      </span>
                      <span className="text-gray-700">
                        {playerEconomy.gdp > aiEconomy.gdp 
                          ? 'Your GDP growth outperformed the AI' 
                          : 'The AI achieved better GDP growth'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 mr-3">
                        💡
                      </span>
                      <span className="text-gray-700">
                        Consider balancing tariffs with subsidies for optimal results
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={startGame}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <FiRefreshCw className="mr-2" />
                    Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with game info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Global Trade Simulator • An interactive economics learning tool</p>
        </div>
      </div>
    </div>
  );
};

// Helper components
const StatCard: React.FC<{
  label: string;
  value: string;
  change?: number;
  isDanger?: boolean;
  icon?: React.ReactNode;
}> = ({ label, value, change = 0, isDanger = false, icon }) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <p className={`text-lg font-semibold ${isDanger ? 'text-red-600' : 'text-gray-900'}`}>
          {value}
        </p>
        {change !== 0 && (
          <span className={`inline-flex items-center text-xs font-medium ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {icon || (
              <svg
                className={`w-3 h-3 mr-0.5 ${change > 0 ? 'rotate-0' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {Math.abs(change).toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
};

const TrendIcon: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) return null;
  
  return (
    <svg
      className={`w-3 h-3 ${value > 0 ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
};

const ActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  color: 'blue' | 'green' | 'purple' | 'gray';
}> = ({ icon, title, description, active, onClick, color }) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      activeBg: 'bg-blue-100',
      activeBorder: 'border-blue-300',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      activeBg: 'bg-green-100',
      activeBorder: 'border-green-300',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      activeBg: 'bg-purple-100',
      activeBorder: 'border-purple-300',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      activeBg: 'bg-gray-100',
      activeBorder: 'border-gray-300',
    },
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border text-left transition-all ${
        active
          ? `${colors[color].activeBg} ${colors[color].activeBorder} ring-1 ring-offset-1 ring-${color}-300`
          : `${colors[color].bg} ${colors[color].border} hover:bg-${color}-100`
      }`}
    >
      <div className="flex items-center mb-2">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${colors[color].bg} ${colors[color].text}`}>
          {icon}
        </span>
        <h4 className={`font-medium ${colors[color].text}`}>{title}</h4>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </button>
  );
};

const ActionBadge: React.FC<{ action: ActionType; value: string }> = ({ action, value }) => {
  if (action === 'none') return <span className="text-gray-500">No action</span>;

  const config = {
    raiseTariff: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      prefix: '↑ ',
    },
    lowerTariff: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      prefix: '↓ ',
    },
    subsidize: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      prefix: '💵 ',
    },
  };

  const { bg, text, prefix } = config[action];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {prefix}{value}
    </span>
  );
};

const GrowthBadge: React.FC<{ value: number }> = ({ value }) => {
  if (value === 0) return <span className="text-gray-500">-</span>;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      value > 0 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {value > 0 ? '+' : ''}{value.toFixed(1)}
    </span>
  );
};

const FinalStatCard: React.FC<{ label: string; value: string; isGood?: boolean }> = ({ 
  label, 
  value, 
  isGood 
}) => {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-lg font-semibold ${
        isGood === undefined 
          ? 'text-gray-900' 
          : isGood 
            ? 'text-green-600' 
            : 'text-red-600'
      }`}>
        {value}
      </p>
    </div>
  );
};

export default TariffGame;