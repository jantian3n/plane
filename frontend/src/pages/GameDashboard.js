import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameDashboard.css';

function GameDashboard({ user, onLogout }) {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddPlaneForm, setShowAddPlaneForm] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [showParkingForm, setShowParkingForm] = useState(false);
  const [parkingDetails, setParkingDetails] = useState({
    aircraftId: '',
    duration: 24, // 默认24小时
  });
  const [imgErrors, setImgErrors] = useState({});
  const [newPlane, setNewPlane] = useState({
    name: '',
    model: 'ARJ21-700'
  });
  
  useEffect(() => {
    fetchGameData();
    fetchNearbyAirports();
  }, []);
  
  // 获取游戏数据
  const fetchGameData = async () => {
    try {
      const token = localStorage.getItem('token');
      // 首先尝试获取游戏数据
      const response = await fetch('http://localhost:5001/api/game/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 如果游戏数据不存在，自动初始化
      if (response.status === 404) {
        await initializeGame();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch game data');
      }
      
      const data = await response.json();
      setGameData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game data:', error);
      setError('Failed to load game data. Trying to initialize game...');
      // 如果获取失败，尝试初始化游戏
      await initializeGame();
    }
  };
  
  // 获取附近机场
  const fetchNearbyAirports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/game/airports/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby airports');
      }
      
      const data = await response.json();
      setNearbyAirports(data.airports || []);
    } catch (error) {
      console.error('Error fetching nearby airports:', error);
      setError('Failed to load nearby airports.');
    }
  };
  
  const initializeGame = async () => {
    // ... 现有的初始化函数保持不变 ...
  };

  const handleAddPlane = async (e) => {
    // ... 现有的添加飞机函数保持不变 ...
  };
  
  // 选择机场
  const handleSelectAirport = (airport) => {
    setSelectedAirport(airport);
    setShowParkingForm(true);
  };
  
  // 处理停靠飞机
  const handleParkAircraft = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/game/aircraft/park', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aircraftId: parkingDetails.aircraftId,
          airportId: selectedAirport.id,
          spotType: 'standard', // 可以添加选择不同类型的功能
          duration: parkingDetails.duration
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to park aircraft');
      }
      
      // 重新获取游戏数据
      fetchGameData();
      setShowParkingForm(false);
      setSelectedAirport(null);
      alert('Aircraft successfully parked at the airport!');
    } catch (error) {
      console.error('Error parking aircraft:', error);
      setError(error.message || 'Failed to park aircraft');
    }
  };
  
  // 处理图片加载错误
  const handleImgError = (model) => {
    setImgErrors(prev => ({
      ...prev,
      [model]: true
    }));
  };
  
  // 根据飞机型号返回emoji
  const getPlaneEmoji = (model) => {
    if (model.includes('ARJ')) return '✈️';
    if (model.includes('C919')) return '🛩️';
    if (model.includes('A320')) return '🛫';
    if (model.includes('A330')) return '🛬';
    if (model.includes('A350')) return '🛪';
    return '✈️';
  };
  
  // 渲染飞机图像或emoji的组件
  const PlaneDisplay = ({ model, className = '' }) => {
    // 如果这个模型的图片之前加载失败过，直接显示emoji
    if (imgErrors[model]) {
      return <span className={`plane-emoji ${className}`}>{getPlaneEmoji(model)}</span>;
    }
    
    // 否则尝试加载图片，失败时回退到emoji
    return (
      <div className={`plane-display ${className}`}>
        <img 
          src={`/images/aircraft/${model}.png`}
          alt={model}
          className="plane-image"
          onError={() => handleImgError(model)}
        />
        <span className="emoji-fallback">{getPlaneEmoji(model)}</span>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Your Airport...</div>
      </div>
    );
  }
  
  // 获取可用于停靠的飞机
  const availableAircraft = gameData?.aircraft?.filter(a => a.status === 'parked') || [];
  
  return (
    <div className="game-dashboard">
      <header className="game-header">
        <div className="game-logo">
          <h1>✈️ Airport Tycoon</h1>
        </div>
        <div className="player-info">
          <span className="balance">💰 {gameData?.gameProfile?.balance?.toLocaleString() || 0} ¥</span>
          <span className="level">👑 Level {gameData?.gameProfile?.level || 1}</span>
          {user.role === 'admin' && <Link to="/admin" className="admin-link">Admin Panel</Link>}
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="game-content">
        {error && <div className="error-message">{error}</div>}

        {/* 我的机场部分 */}
        <div className="airport-section">
          <h2>🏢 {gameData?.airports?.[0]?.name || `${user.username}'s Airport`}</h2>
          
          <div className="airport-visual">
            <div className="runway">✈️ RUNWAY ✈️</div>
            <div className="terminal">🏢 TERMINAL</div>
            <div className="parking-area">
              <h3>Parking Area</h3>
              <div className="parking-spots">
                {gameData?.airports?.[0]?.parkingSpots?.map((spot, index) => (
                  <div key={index} className={`parking-spot ${spot.occupied ? 'occupied' : 'empty'}`}>
                    {spot.occupied ? (
                      spot.occupiedBy && <PlaneDisplay model={
                        gameData.aircraft.find(a => a._id === spot.occupiedBy)?.model || "ARJ21-700"
                      } />
                    ) : '⬜'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* 财务状态卡片 */}
          <div className="dashboard-card">
            <h3>📊 Financial Status</h3>
            <div className="finance-details">
              <div className="finance-item">
                <span className="finance-label">Current Balance:</span>
                <span className="finance-value">{gameData?.gameProfile?.balance?.toLocaleString() || 0} ¥</span>
              </div>
              <div className="finance-item">
                <span className="finance-label">Total Revenue:</span>
                <span className="finance-value">{gameData?.gameProfile?.statistics?.totalRevenue?.toLocaleString() || 0} ¥</span>
              </div>
              <div className="finance-item">
                <span className="finance-label">Total Expenses:</span>
                <span className="finance-value">{gameData?.gameProfile?.statistics?.totalExpenses?.toLocaleString() || 0} ¥</span>
              </div>
            </div>
          </div>

          {/* 我的机队卡片 */}
          <div className="dashboard-card">
            <h3>🛩️ Your Fleet</h3>
            {gameData?.aircraft?.length > 0 ? (
              <div className="fleet-list">
                {gameData.aircraft.map(plane => (
                  <div key={plane._id} className={`plane-item ${plane.status}`}>
                    <PlaneDisplay model={plane.model} />
                    <div className="plane-details">
                      <div className="plane-name">{plane.name}</div>
                      <div className="plane-model">{plane.model}</div>
                      <div className="plane-status">Status: {plane.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-planes">
                <p>You don't have any aircraft yet.</p>
                <button className="add-plane-btn" onClick={() => setShowAddPlaneForm(true)}>Buy Your First Aircraft</button>
              </div>
            )}
            {gameData?.aircraft?.length > 0 && (
              <button className="add-plane-btn" onClick={() => setShowAddPlaneForm(true)}>Buy New Aircraft</button>
            )}
          </div>
        </div>

        {/* 新增: 周围的机场部分 */}
        <div className="dashboard-card nearby-airports-section">
          <h3>🌎 Nearby Airports</h3>
          
          {nearbyAirports.length > 0 ? (
            <div className="airports-grid">
              {nearbyAirports.map(airport => (
                <div key={airport.id} className="nearby-airport-card">
                  <h4>{airport.name}</h4>
                  <div className="airport-info">
                    <p>Owner: {airport.ownerName}</p>
                    <p>Level: {airport.level}</p>
                    <p>Available Spots: {airport.availableSpots}</p>
                    <p>Standard Fee: {airport.parkingFees.standard}¥/day</p>
                  </div>
                  <button 
                    className="visit-airport-btn" 
                    onClick={() => handleSelectAirport(airport)}
                    disabled={availableAircraft.length === 0}
                  >
                    {availableAircraft.length === 0 ? "No Aircraft Available" : "Park Aircraft Here"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-airports">No other airports available at the moment.</p>
          )}
        </div>

        {/* 添加飞机的表单 */}
        {showAddPlaneForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Buy New Aircraft</h3>
              <form onSubmit={handleAddPlane} className="add-plane-form">
                <div className="form-group">
                  <label htmlFor="planeName">Aircraft Name:</label>
                  <input 
                    type="text" 
                    id="planeName" 
                    value={newPlane.name} 
                    onChange={(e) => setNewPlane({...newPlane, name: e.target.value})}
                    placeholder="Enter aircraft name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="planeModel">Aircraft Model:</label>
                  <select 
                    id="planeModel"
                    value={newPlane.model}
                    onChange={(e) => setNewPlane({...newPlane, model: e.target.value})}
                  >
                    <option value="ARJ21-700">ARJ21-700 (2,000¥)</option>
                    <option value="ARJ21-900">ARJ21-900 (2,800¥)</option>
                    <option value="C919-A">C919-A (2,800¥)</option>
                    <option value="C919-B">C919-B (3,500¥)</option>
                    <option value="A320">Airbus A320 (3,500¥)</option>
                    <option value="A330">Airbus A330 (4,200¥)</option>
                    <option value="A350">Airbus A350 (5,000¥)</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="model-preview">
                    <p>Preview:</p>
                    <PlaneDisplay model={newPlane.model} className="preview-plane" />
                  </div>
                </div>
                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowAddPlaneForm(false)} className="cancel-btn">Cancel</button>
                  <button type="submit" className="submit-btn">Purchase Aircraft</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 新增: 停靠飞机的表单 */}
        {showParkingForm && selectedAirport && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Park Aircraft at {selectedAirport.name}</h3>
              <form onSubmit={handleParkAircraft} className="parking-form">
                <div className="form-group">
                  <label htmlFor="aircraftSelect">Select Aircraft:</label>
                  <select 
                    id="aircraftSelect"
                    value={parkingDetails.aircraftId}
                    onChange={(e) => setParkingDetails({...parkingDetails, aircraftId: e.target.value})}
                    required
                  >
                    <option value="">-- Select an aircraft --</option>
                    {availableAircraft.map(aircraft => (
                      <option key={aircraft._id} value={aircraft._id}>
                        {aircraft.name} ({aircraft.model})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="parkDuration">Parking Duration (hours):</label>
                  <input 
                    type="number" 
                    id="parkDuration"
                    min="1"
                    max="72"
                    value={parkingDetails.duration}
                    onChange={(e) => setParkingDetails({
                      ...parkingDetails, 
                      duration: Math.min(72, Math.max(1, parseInt(e.target.value) || 1))
                    })}
                  />
                  <small>Maximum duration: 72 hours</small>
                </div>
                
                <div className="fee-preview">
                  <p>Parking Fee:</p>
                  <p className="fee-amount">{selectedAirport.parkingFees.standard * parkingDetails.duration}¥</p>
                  <p className="fee-info">
                    (Base rate: {selectedAirport.parkingFees.standard}¥ × {parkingDetails.duration} hours)
                  </p>
                </div>
                
                <div className="benefit-info">
                  <p>🔄 You will pay a service fee to the airport owner.</p>
                  <p>💰 In return, you'll receive random dividends based on passenger traffic.</p>
                </div>
                
                <div className="modal-buttons">
                  <button type="button" onClick={() => {
                    setShowParkingForm(false);
                    setSelectedAirport(null);
                    setParkingDetails({aircraftId: '', duration: 24});
                  }} className="cancel-btn">Cancel</button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={!parkingDetails.aircraftId}
                  >
                    Confirm Parking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <footer className="game-footer">
        <p>&copy; {new Date().getFullYear()} Airport Tycoon Game | Created by AI Developer</p>
      </footer>
    </div>
  );
}

export default GameDashboard;