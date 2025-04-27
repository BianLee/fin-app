"use client"
import { useState } from 'react';

export const useTariffGame = () => {
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

  // Get AI personality description
  const getAIPersonalityDescription = () => {
    switch(aiType) {
      case 'aggressive':
        return "This AI will retaliate strongly against tariff increases and is unlikely to make concessions.";
      case 'defensive':
        return "This AI reacts primarily when its economy is damaged and is otherwise cautious.";
      case 'negotiator':
        return "This AI seeks balanced trade and is more likely to respond favorably to tariff reductions.";
      default:
        return "This AI uses a mixed strategy balancing protection and free trade.";
    }
  };

  return {
    // Game state
    gameActive,
    currentTurn,
    maxTurns,
    setMaxTurns,
    gameOver,
    gameResult,
    
    // Economy stats
    playerEconomy,
    aiEconomy,
    
    // Action state
    selectedAction,
    setSelectedAction,
    tariffChangeAmount,
    setTariffChangeAmount,
    subsidyAmount,
    setSubsidyAmount,
    turnHistory,
    showHistory,
    setShowHistory,
    
    // AI behavior type
    aiType,
    setAiType,
    getAIPersonalityDescription,
    
    // Game functions
    startGame,
    executeTurn,
    getChartData
  };
};