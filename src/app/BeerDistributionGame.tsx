import React, { useState, useEffect } from 'react';

const BeerDistributionGame = () => {
  // Game configuration
  const initialBacklog = 0;
  const initialInventory = 12;
  const initialWeeks = 1;
  const gameLength = 20; // Total weeks to play
  const shippingDelay = 2;
  const incomingOrdersDelay = 1;
  const productionDelay = 2;
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(initialWeeks);
  const [showInstructions, setShowInstructions] = useState(true);
  const [orderAmount, setOrderAmount] = useState(4); // Default order
  
  // Player roles
  const roles = ['Retailer', 'Wholesaler', 'Distributor', 'Factory'];
  const [activeRole, setActiveRole] = useState('Retailer');
  
  // Initialize game data structure
  const initializeRoleData = () => {
    const data = {};
    roles.forEach(role => {
      data[role] = {
        inventory: initialInventory,
        backlog: initialBacklog,
        incomingOrders: [4, 4], // Initial incoming orders
        outgoingShipments: [4, 4], // Initial outgoing shipments
        incomingShipments: [4, 4], // Initial incoming shipments
        placedOrders: [4, 4], // Initial orders placed upstream
        orderHistory: [4], // History of orders placed
        inventoryHistory: [initialInventory], // History of inventory
        costs: 0, // Accumulated costs
      };
    });
    return data;
  };
  
  const [gameData, setGameData] = useState(initializeRoleData());
  
  // Customer demand pattern
  const customerDemand = Array(gameLength + 5).fill(4);
  // Week 5 has a demand spike to 8 units
  customerDemand[4] = 8;
  
  // Animation state for flow diagram
  const [flowAnimation, setFlowAnimation] = useState({
    orders: null,
    shipments: null
  });
  
  // Function to process a player's order
  const placeOrder = () => {
    if (gameCompleted) return;
    
    // Update game data with the current order
    setGameData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Record the order in history
      newData[activeRole].orderHistory.push(orderAmount);
      newData[activeRole].placedOrders.push(orderAmount);
      
      return newData;
    });
    
    // Trigger order flow animation
    const roleIndex = roles.indexOf(activeRole);
    if (roleIndex < roles.length - 1) {
      setFlowAnimation({
        orders: {
          from: roleIndex,
          to: roleIndex + 1,
          amount: orderAmount
        },
        shipments: null
      });
      
      // Clear animation after a delay
      setTimeout(() => {
        setFlowAnimation({
          orders: null,
          shipments: null
        });
      }, 1500);
    }
    
    // Move to next role or next week
    const currentRoleIndex = roles.indexOf(activeRole);
    if (currentRoleIndex < roles.length - 1) {
      // Move to next role
      setActiveRole(roles[currentRoleIndex + 1]);
    } else {
      // All roles have placed orders, process the week
      processWeek();
    }
  };
  
  // Process a week in the game
  const processWeek = () => {
    // Animate shipment flows for all roles
    const animateShipments = () => {
      for (let i = roles.length - 1; i >= 0; i--) {
        const shipmentAmount = gameData[roles[i]].outgoingShipments[0] || 0;
        if (i > 0) {
          setTimeout(() => {
            setFlowAnimation({
              orders: null,
              shipments: {
                from: i,
                to: i - 1,
                amount: shipmentAmount
              }
            });
          }, (roles.length - i) * 800);
        }
      }
      
      // Clear animation after all shipments
      setTimeout(() => {
        setFlowAnimation({
          orders: null,
          shipments: null
        });
      }, (roles.length + 1) * 800);
    };
    
    setGameData(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData));
      
      // Process customer order for Retailer
      const demand = customerDemand[currentWeek - 1];
      newData.Retailer.incomingOrders.push(demand);
      
      // Process each role's supply chain operations
      roles.forEach((role, index) => {
        const roleData = newData[role];
        
        // 1. Receive shipment from upstream
        const receivedShipment = roleData.incomingShipments.shift() || 0;
        roleData.inventory += receivedShipment;
        
        // 2. Fulfill orders (prioritize backlog)
        const newOrder = roleData.incomingOrders.shift() || 0;
        const totalDemand = roleData.backlog + newOrder;
        const fulfilled = Math.min(totalDemand, roleData.inventory);
        roleData.backlog = totalDemand - fulfilled;
        roleData.inventory -= fulfilled;
        
        // 3. Ship fulfilled orders downstream (delayed)
        roleData.outgoingShipments.push(fulfilled);
        
        // 4. Pass the order to the next upstream role (if not factory)
        if (index < roles.length - 1) {
          newData[roles[index + 1]].incomingOrders.push(roleData.placedOrders.shift() || 0);
        }
        
        // 5. For Factory, process production (convert orders to future incoming shipments)
        if (role === 'Factory') {
          const production = roleData.placedOrders.shift() || 0;
          // Production delay
          if (roleData.incomingShipments.length < productionDelay) {
            roleData.incomingShipments.push(0); // Fill with 0 if not enough entries
          }
          roleData.incomingShipments.push(production);
        } else {
          // For non-factory roles, incoming shipments come from upstream's outgoing
          const upstreamRole = roles[index + 1];
          const upstreamShipment = newData[upstreamRole]?.outgoingShipments.shift() || 0;
          roleData.incomingShipments.push(upstreamShipment);
        }
        
        // 6. Calculate costs (inventory holding cost and backlog cost)
        const inventoryCost = roleData.inventory * 0.5; // $0.50 per unit per week
        const backlogCost = roleData.backlog * 1.0; // $1.00 per unit per week
        roleData.costs += (inventoryCost + backlogCost);
        
        // 7. Record inventory history
        roleData.inventoryHistory.push(roleData.inventory);
      });
      
      return newData;
    });
    
    // Animate shipment flows
    animateShipments();
    
    // Reset to first role for next week
    setActiveRole(roles[0]);
    setOrderAmount(4); // Reset to default order
    
    // Advance week
    setCurrentWeek(prevWeek => {
      const newWeek = prevWeek + 1;
      // Check if game is completed
      if (newWeek > gameLength) {
        setGameCompleted(true);
      }
      return newWeek;
    });
  };
  
  // Start a new game
  const startNewGame = () => {
    setGameData(initializeRoleData());
    setCurrentWeek(initialWeeks);
    setActiveRole(roles[0]);
    setOrderAmount(4);
    setGameStarted(true);
    setGameCompleted(false);
    setShowInstructions(false);
  };
  
  // Calculate total costs for each role
  const calculateTotalCosts = () => {
    return roles.map(role => ({
      role,
      cost: gameData[role].costs.toFixed(2)
    }));
  };
  
  // Generate chart data for visualization
  const generateChartData = () => {
    return {
      labels: Array.from({ length: currentWeek }, (_, i) => `Week ${i + 1}`),
      datasets: roles.map((role, index) => ({
        role,
        orders: gameData[role].orderHistory,
        inventory: gameData[role].inventoryHistory
      }))
    };
  };
  
  // Supply Chain Flow Diagram Component
  const SupplyChainFlowDiagram = () => {
    const getNodeColor = (roleName) => {
      if (roleName === activeRole) return 'bg-blue-100 border-blue-500';
      return 'bg-gray-100 border-gray-300';
    };
    
    const getInventoryColor = (role) => {
      const inventory = gameData[role].inventory;
      if (inventory <= 2) return 'text-red-600';
      if (inventory <= 5) return 'text-yellow-600';
      return 'text-green-600';
    };
    
    const getBacklogColor = (role) => {
      const backlog = gameData[role].backlog;
      if (backlog >= 10) return 'text-red-600';
      if (backlog >= 5) return 'text-orange-600';
      if (backlog > 0) return 'text-yellow-600';
      return 'text-gray-600';
    };
    
    const renderOrderAnimation = (from, to, amount) => {
      const fromRatio = from / (roles.length);
      const toRatio = to / (roles.length);
      
      const orderArrowStyle = {
        left: `calc(${fromRatio * 100}% + 50px)`,
        width: `calc(${(toRatio - fromRatio) * 100}% - 100px)`,
        top: '25px',
        height: '20px',
        background: 'linear-gradient(to right, transparent, #3b82f6)',
        position: 'absolute',
        animation: 'flowRight 1.5s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 10
      };
      
      return (
        <div style={orderArrowStyle} className="rounded">
          <div className="bg-blue-500 px-2 py-1 rounded text-xs">{amount}</div>
        </div>
      );
    };
    
    const renderShipmentAnimation = (from, to, amount) => {
      const fromRatio = from / (roles.length);
      const toRatio = to / (roles.length);
      
      const shipmentArrowStyle = {
        left: `calc(${toRatio * 100}% + 50px)`,
        width: `calc(${(fromRatio - toRatio) * 100}% - 100px)`,
        bottom: '25px',
        height: '20px',
        background: 'linear-gradient(to left, transparent, #10b981)',
        position: 'absolute',
        animation: 'flowLeft 1.5s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        zIndex: 10
      };
      
      return (
        <div style={shipmentArrowStyle} className="rounded">
          <div className="bg-green-500 px-2 py-1 rounded text-xs">{amount}</div>
        </div>
      );
    };
    
    // Add customer node to the left and supplier node to the right
    const extendedRoles = ['Customers', ...roles, 'Raw Materials'];
    
    return (
      <div className="relative mt-8 p-8 bg-white rounded-lg shadow-md mb-8">
        <h3 className="font-semibold mb-6 text-center">Supply Chain Flow Diagram - Week {currentWeek}</h3>
        
        <div className="relative h-64">
          {/* Render static flow lines */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-blue-200" />
          <div className="absolute bottom-1/3 left-0 right-0 h-0.5 bg-green-200" />
          
          {/* Order Information Flow (top arrow) */}
          <div className="absolute top-16 left-0 right-0 text-center text-sm text-blue-600 font-medium">
            Order Information Flow
          </div>
          
          {/* Beer Flow (bottom arrow) */}
          <div className="absolute bottom-16 left-0 right-0 text-center text-sm text-green-600 font-medium">
            Beer Shipment Flow
          </div>
          
          {/* Role Nodes */}
          <div className="flex justify-between relative z-20">
            {extendedRoles.map((role, index) => {
              const isEndpoint = index === 0 || index === extendedRoles.length - 1;
              const isActualRole = roles.includes(role);
              
              return (
                <div key={role} className="flex flex-col items-center" style={{width: `${100 / extendedRoles.length}%`}}>
                  <div className={`w-24 h-24 flex flex-col items-center justify-center rounded-lg border-2 shadow-sm
                    ${isEndpoint ? 'bg-gray-50 border-gray-200' : getNodeColor(role)}`}>
                    <div className="font-medium text-center">{role}</div>
                    
                    {isActualRole && (
                      <>
                        <div className={`text-sm ${getInventoryColor(role)}`}>
                          Inv: {gameData[role].inventory}
                        </div>
                        <div className={`text-sm ${getBacklogColor(role)}`}>
                          Backlog: {gameData[role].backlog}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Pending Orders */}
                  {isActualRole && (
                    <div className="mt-3 flex flex-col items-center">
                      <div className="text-xs text-gray-500">Pending Orders</div>
                      <div className="flex space-x-1 mt-1">
                        {gameData[role].placedOrders.map((order, idx) => (
                          <div key={idx} className="w-5 h-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-xs">
                            {order}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Pending Shipments */}
                  {isActualRole && (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="text-xs text-gray-500">Pending Shipments</div>
                      <div className="flex space-x-1 mt-1">
                        {gameData[role].outgoingShipments.map((shipment, idx) => (
                          <div key={idx} className="w-5 h-5 bg-green-100 border border-green-300 rounded-full flex items-center justify-center text-xs">
                            {shipment}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Render animations */}
          {flowAnimation.orders && renderOrderAnimation(
            flowAnimation.orders.from + 1,  // +1 to account for the customer node
            flowAnimation.orders.to + 1, 
            flowAnimation.orders.amount
          )}
          
          {flowAnimation.shipments && renderShipmentAnimation(
            flowAnimation.shipments.from + 1,  // +1 to account for the customer node
            flowAnimation.shipments.to + 1, 
            flowAnimation.shipments.amount
          )}
        </div>
        
        {/* Animation legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Order Flow</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Shipment Flow</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded mr-2"></div>
            <span className="text-sm">Active Role</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-4">Beer Distribution Game</h1>
      <p className="text-center mb-6">Learn about the bullwhip effect in supply chains</p>
      
      {showInstructions && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">How to Play</h2>
          <p className="mb-4">
            The Beer Distribution Game simulates a simplified beer supply chain with four roles: 
            Retailer, Wholesaler, Distributor, and Factory. Each player manages one role.
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">Game Rules:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Each player can only see their own inventory and orders.</li>
            <li>There are delays in shipping (2 weeks) and order information (1 week).</li>
            <li>The goal is to minimize costs while meeting demand.</li>
            <li>Holding inventory costs $0.50 per unit per week.</li>
            <li>Backlog (unfulfilled orders) costs $1.00 per unit per week.</li>
            <li>The game runs for {gameLength} weeks, with a demand pattern unknown to players.</li>
          </ul>
          
          <button 
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            onClick={startNewGame}
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameStarted && !gameCompleted && (
        <>
          {/* Supply Chain Flow Diagram */}
          {gameStarted && !showInstructions && <SupplyChainFlowDiagram />}
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Week {currentWeek}/{gameLength}</h2>
              <div className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full">
                Playing as: <strong>{activeRole}</strong>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Inventory Status</h3>
                <p>Current Inventory: <strong>{gameData[activeRole].inventory}</strong> units</p>
                <p>Backlogged Orders: <strong>{gameData[activeRole].backlog}</strong> units</p>
                <p>Accumulated Costs: <strong>${gameData[activeRole].costs.toFixed(2)}</strong></p>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Order Information</h3>
                <p>Incoming Order: <strong>{gameData[activeRole].incomingOrders[0] || 0}</strong> units</p>
                {activeRole === 'Retailer' && currentWeek > 1 && (
                  <p className="text-sm mt-2">This is the customer demand for this week.</p>
                )}
                <p>Expected Incoming Shipment: <strong>{gameData[activeRole].incomingShipments[0] || 0}</strong> units</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Place Your Order</h3>
              <p className="mb-2">How many units would you like to order from your supplier?</p>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(parseInt(e.target.value) || 0)}
                  className="px-4 py-2 border rounded w-24 mr-4"
                />
                <button 
                  onClick={placeOrder}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {gameCompleted && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Game Results</h2>
          <p className="mb-6">The game has ended after {gameLength} weeks. Here are your results:</p>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Total Costs by Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {calculateTotalCosts().map(({ role, cost }) => (
                <div key={role} className="p-4 bg-gray-100 rounded-lg text-center">
                  <h4 className="font-medium">{role}</h4>
                  <p className="text-xl font-bold">${cost}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Order Patterns (Bullwhip Effect)</h3>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="mb-4">Notice how the order patterns amplify as you move upstream in the supply chain:</p>
              
              {roles.map(role => (
                <div key={role} className="mb-4">
                  <h4 className="font-medium mb-2">{role} Orders:</h4>
                  <div className="flex items-center">
                    <div className="w-24 text-right mr-2">Week 1-5:</div>
                    <div className="flex">
                      {gameData[role].orderHistory.slice(0, 5).map((order, idx) => (
                        <div 
                          key={idx} 
                          className="w-8 h-8 flex items-center justify-center border"
                        >
                          {order}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 text-right mr-2">Week 6-10:</div>
                    <div className="flex">
                      {gameData[role].orderHistory.slice(5, 10).map((order, idx) => (
                        <div 
                          key={idx} 
                          className="w-8 h-8 flex items-center justify-center border"
                        >
                          {order}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={startNewGame}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">About the Beer Distribution Game</h2>
        <p className="mb-4">
          This game was developed at MIT in the 1960s to demonstrate principles of system dynamics and supply chain management. 
          It illustrates the "bullwhip effect" - how small changes in consumer demand can create increasingly larger 
          fluctuations in orders as you move up the supply chain.
        </p>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Learning Objectives:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Understand the causes of the bullwhip effect in supply chains</li>
            <li>Experience how decision-making under uncertainty affects system performance</li>
            <li>Learn the impact of delays on system stability</li>
            <li>Practice inventory management strategies</li>
          </ul>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">Key Causes of the Bullwhip Effect:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Demand Forecast Updating:</strong> Reacting to short-term fluctuations</li>
            <li><strong>Order Batching:</strong> Ordering in larger amounts less frequently</li>
            <li><strong>Price Fluctuations:</strong> Buying in response to promotions rather than demand</li>
            <li><strong>Rationing and Shortage Gaming:</strong> Ordering more when supply is constrained</li>
          </ul>
        </div>
        
        {!gameStarted && !showInstructions && (
          <button 
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            onClick={() => setShowInstructions(true)}
          >
            Show Instructions
          </button>
        )}
      </div>
      
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes flowRight {
          0% { width: 0; opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes flowLeft {
          0% { width: 0; opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BeerDistributionGame;