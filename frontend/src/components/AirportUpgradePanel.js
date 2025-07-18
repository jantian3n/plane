import React, { useState } from 'react';
import '../styles/AirportUpgradePanel.css';

const AirportUpgradePanel = ({ airport, gameProfile, onClose, onUpgrade }) => {
  const [selectedUpgradeType, setSelectedUpgradeType] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [loading, setLoading] = useState(false);

  // 定义升级选项
  const upgradeOptions = [
    { 
      type: 'runway', 
      name: 'New Runway',
      description: 'Add a new runway to accommodate more aircraft',
      cost: 5000,
      icon: '✈️',
      subtypes: [
        { id: 'small', name: 'Small Runway (2000m)', details: 'Suitable for regional jets', cost: 5000 },
        { id: 'medium', name: 'Medium Runway (3000m)', details: 'Suitable for medium-sized aircraft', cost: 8000 },
        { id: 'large', name: 'Large Runway (4000m)', details: 'Suitable for wide-body aircraft', cost: 12000 }
      ]
    },
    { 
      type: 'parking', 
      name: 'New Parking Spot',
      description: 'Add a new spot to park aircraft',
      cost: 1000,
      icon: '🅿️',
      subtypes: [
        { id: 'standard', name: 'Standard Spot', details: 'Fee: 100¥/day', cost: 1000 },
        { id: 'premium', name: 'Premium Spot', details: 'Fee: 200¥/day', cost: 2000 },
        { id: 'exclusive', name: 'Exclusive Spot', details: 'Fee: 300¥/day', cost: 3000 }
      ]
    },
    { 
      type: 'facility', 
      name: 'Airport Facility',
      description: 'Add or upgrade airport facilities',
      icon: '🏢',
      subtypes: [
        { 
          id: 'terminal', 
          name: 'Terminal', 
          details: 'Increases passenger capacity',
          cost: (airport.facilities.find(f => f.type === 'terminal')?.level || 0) > 0 
            ? 2000 * (airport.facilities.find(f => f.type === 'terminal')?.level || 1) 
            : 3000,
          isUpgrade: airport.facilities.find(f => f.type === 'terminal')?.level > 0
        },
        { 
          id: 'maintenance', 
          name: 'Maintenance Hangar', 
          details: 'Reduces aircraft maintenance costs',
          cost: (airport.facilities.find(f => f.type === 'maintenance')?.level || 0) > 0 
            ? 2000 * (airport.facilities.find(f => f.type === 'maintenance')?.level || 1) 
            : 3000,
          isUpgrade: airport.facilities.find(f => f.type === 'maintenance')?.level > 0
        },
        { 
          id: 'catering', 
          name: 'Catering Service', 
          details: 'Increases passenger satisfaction',
          cost: (airport.facilities.find(f => f.type === 'catering')?.level || 0) > 0 
            ? 2000 * (airport.facilities.find(f => f.type === 'catering')?.level || 1) 
            : 3000,
          isUpgrade: airport.facilities.find(f => f.type === 'catering')?.level > 0
        },
        { 
          id: 'fuel', 
          name: 'Fuel Depot', 
          details: 'Reduces flight operation costs',
          cost: (airport.facilities.find(f => f.type === 'fuel')?.level || 0) > 0 
            ? 2000 * (airport.facilities.find(f => f.type === 'fuel')?.level || 1) 
            : 3000,
          isUpgrade: airport.facilities.find(f => f.type === 'fuel')?.level > 0
        }
      ]
    },
    { 
      type: 'airport', 
      name: 'Upgrade Airport',
      description: 'Upgrade the entire airport to the next level',
      cost: 10000 * airport.level,
      icon: '🏆'
    }
  ];

  // 处理升级选择
  const handleSelectUpgradeType = (type) => {
    setSelectedUpgradeType(type);
    setSelectedSubtype(null);
  };

  // 处理子类型选择并执行升级
  const handleSelectSubtype = (subtype) => {
    setSelectedSubtype(subtype);
  };

  // 执行升级
  const handleConfirmUpgrade = () => {
    const upgrade = upgradeOptions.find(opt => opt.type === selectedUpgradeType);
    if (!upgrade) return;
    
    let upgradeSubType = null;
    
    if (upgrade.subtypes && selectedSubtype) {
      upgradeSubType = selectedSubtype.id;
    }
    
    setLoading(true);
    onUpgrade(selectedUpgradeType, upgradeSubType)
      .finally(() => setLoading(false));
  };

  // 计算当前选择的升级费用
  const calculateCost = () => {
    const upgrade = upgradeOptions.find(opt => opt.type === selectedUpgradeType);
    if (!upgrade) return 0;
    
    if (selectedSubtype && selectedSubtype.cost) {
      return selectedSubtype.cost;
    }
    
    return upgrade.cost || 0;
  };

  // 检查是否有足够的资金
  const hasSufficientFunds = gameProfile.balance >= calculateCost();

  return (
    <div className="modal-overlay">
      <div className="modal-content upgrade-panel">
        <div className="modal-header">
          <h3>Airport Upgrade</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="upgrade-content">
          <div className="airport-overview">
            <h4>{airport.name} (Level {airport.level})</h4>
            <div className="balance-display">
              <span>Your Balance:</span>
              <span className="balance-amount">{gameProfile.balance.toLocaleString()}¥</span>
            </div>
          </div>
          
          {/* 步骤 1: 选择升级类型 */}
          {!selectedUpgradeType && (
            <div className="upgrade-selection">
              <h4>Select Upgrade Type:</h4>
              <div className="upgrade-options">
                {upgradeOptions.map(option => (
                  <div 
                    key={option.type} 
                    className="upgrade-option-card"
                    onClick={() => handleSelectUpgradeType(option.type)}
                  >
                    <div className="option-icon">{option.icon}</div>
                    <div className="option-details">
                      <h5>{option.name}</h5>
                      <p>{option.description}</p>
                      <div className="option-cost">
                        Cost: {option.subtypes ? 'Varies' : `${option.cost.toLocaleString()}¥`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 步骤 2: 选择子类型（如果有） */}
          {selectedUpgradeType && upgradeOptions.find(opt => opt.type === selectedUpgradeType).subtypes && (
            <div className="subtype-selection">
              <button 
                className="back-button"
                onClick={() => setSelectedUpgradeType(null)}
              >
                ← Back to Upgrade Types
              </button>
              
              <h4>Select {upgradeOptions.find(opt => opt.type === selectedUpgradeType).name} Type:</h4>
              
              <div className="subtype-options">
                {upgradeOptions.find(opt => opt.type === selectedUpgradeType).subtypes.map(subtype => (
                  <div 
                    key={subtype.id} 
                    className={`subtype-card ${selectedSubtype?.id === subtype.id ? 'selected' : ''}`}
                    onClick={() => handleSelectSubtype(subtype)}
                  >
                    <h5>
                      {subtype.name} 
                      {subtype.isUpgrade && <span className="upgrade-badge">Upgrade</span>}
                    </h5>
                    <p>{subtype.details}</p>
                    <div className="subtype-cost">Cost: {subtype.cost.toLocaleString()}¥</div>
                  </div>
                ))}
              </div>
              
              {selectedSubtype && (
                <div className="upgrade-confirmation">
                  <h4>Confirm Upgrade:</h4>
                  <div className="confirmation-details">
                    <p>
                      <strong>Type:</strong> {upgradeOptions.find(opt => opt.type === selectedUpgradeType).name} - {selectedSubtype.name}
                    </p>
                    <p>
                      <strong>Cost:</strong> {selectedSubtype.cost.toLocaleString()}¥
                    </p>
                    <p>
                      <strong>Balance After Upgrade:</strong> {(gameProfile.balance - selectedSubtype.cost).toLocaleString()}¥
                    </p>
                  </div>
                  
                  <button 
                    className="confirm-btn"
                    onClick={handleConfirmUpgrade}
                    disabled={!hasSufficientFunds || loading}
                  >
                    {loading ? 'Processing...' : hasSufficientFunds ? 'Confirm Upgrade' : 'Insufficient Funds'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* 步骤 2/3: 直接确认（对于没有子类型的升级） */}
          {selectedUpgradeType && !upgradeOptions.find(opt => opt.type === selectedUpgradeType).subtypes && (
            <div className="upgrade-confirmation">
              <button 
                className="back-button"
                onClick={() => setSelectedUpgradeType(null)}
              >
                ← Back to Upgrade Types
              </button>
              
              <h4>Confirm Upgrade:</h4>
              <div className="confirmation-details">
                <p>
                  <strong>Type:</strong> {upgradeOptions.find(opt => opt.type === selectedUpgradeType).name}
                </p>
                <p>
                  <strong>Description:</strong> {upgradeOptions.find(opt => opt.type === selectedUpgradeType).description}
                </p>
                <p>
                  <strong>Cost:</strong> {upgradeOptions.find(opt => opt.type === selectedUpgradeType).cost.toLocaleString()}¥
                </p>
                <p>
                  <strong>Balance After Upgrade:</strong> {(gameProfile.balance - upgradeOptions.find(opt => opt.type === selectedUpgradeType).cost).toLocaleString()}¥
                </p>
              </div>
              
              <button 
                className="confirm-btn"
                onClick={handleConfirmUpgrade}
                disabled={!hasSufficientFunds || loading}
              >
                {loading ? 'Processing...' : hasSufficientFunds ? 'Confirm Upgrade' : 'Insufficient Funds'}
              </button>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AirportUpgradePanel;
