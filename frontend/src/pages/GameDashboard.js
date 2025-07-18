import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GameDashboard.css';
import RouteSetupModal from '../components/RouteSetupModal';
import AirportUpgradePanel from '../components/AirportUpgradePanel';
import LeaderboardPanel from '../components/LeaderboardPanel';
import AircraftDetailView from '../components/AircraftDetailView';
import TransactionHistory from '../components/TransactionHistory';

// 定义API基础URL - 在开发和生产环境都适用
const API_URL = '/api';

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
  
  // 新增的状态变量
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAircraftDetail, setShowAircraftDetail] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 用于导航
  
  useEffect(() => {
    fetchGameData();
    fetchNearbyAirports();
  }, []);
  
  // 获取游戏数据
  const fetchGameData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/game/dashboard`, {
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
      const response = await fetch(`${API_URL}/game/airports/available`, {
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
  
  // 初始化游戏
  const initializeGame = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/game/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize game');
      }
      
      // 初始化成功后重新获取数据
      await fetchGameData();
    } catch (error) {
      console.error('Error initializing game:', error);
      setError('Failed to initialize game. Please try again.');
      setLoading(false);
    }
  };

  // 添加飞机
  const handleAddPlane = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/game/aircraft/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPlane)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to purchase aircraft');
      }
      
      // 重新获取游戏数据
      fetchGameData();
      setShowAddPlaneForm(false);
      setNewPlane({ name: '', model: 'ARJ21-700' });
      alert('Aircraft successfully purchased!');
    } catch (error) {
      console.error('Error purchasing aircraft:', error);
      setError(error.message || 'Failed to purchase aircraft');
    }
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
      const response = await fetch(`${API_URL}/game/aircraft/park`, {
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

  // 设置飞机航线
  const handleSetRoute = async (aircraftId, destinationId, departureTime) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/game/aircraft/${aircraftId}/route`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destinationId, departureTime })
      });
      
      if (!response.ok) {
        throw new Error('Failed to set aircraft route');
      }
      
      // 更新游戏数据
      fetchGameData();
      setShowRouteModal(false);
      alert('Flight route set successfully!');
    } catch (error) {
      console.error('Error setting route:', error);
      setError(error.message);
    }
  };

  // 升级机场
  const handleUpgrade = async (upgradeType, upgradeSubType) => {
    try {
      const token = localStorage.getItem('token');
      const airportId = gameData.airports[0]._id;
      
      const response = await fetch(`${API_URL}/game/airport/${airportId}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ upgradeType, upgradeSubType })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade airport');
      }
      
      // 更新游戏数据
      fetchGameData();
      setShowUpgradePanel(false);
      alert('Airport upgraded successfully!');
    } catch (error) {
      console.error('Error upgrading airport:', error);
      setError(error.message || 'Failed to upgrade airport');
    }
  };

  // 获取排行榜
  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/game/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboardData(data);
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message || 'Failed to load leaderboard');
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
  
  // 渲染飞机图像或emoji的组件 - 修改后的版本，emoji在图片下方
  const PlaneDisplay = ({ model, className = '' }) => {
    // 如果这个模型的图片之前加载失败过，直接显示emoji
    if (imgErrors[model]) {
      return <span className={`plane-emoji ${className}`}>{getPlaneEmoji(model)}</span>;
    }
    
    // 否则尝试加载图片，emoji作为背景，图片加载失败时emoji会显示
    return (
      <div className={`plane-display ${className}`}>
        <span className="emoji-fallback">{getPlaneEmoji(model)}</span>
        <img 
          src={`/images/aircraft/${model}.png`}
          alt={model}
          className="plane-image"
          onError={() => handleImgError(model)}
        />
      </div>
    );
  };

  // 处理显示飞机详情
  const handleShowAircraftDetail = (aircraft) => {
    setSelectedAircraft(aircraft);
    setShowAircraftDetail(true);
  };

  // 处理设置航线
  const handleShowRouteSetup = (aircraft) => {
    setSelectedAircraft(aircraft);
    setShowRouteModal(true);
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
        <div className="navigation-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            Fleet Management
          </button>
          <button 
            className={`nav-tab ${activeTab === 'airports' ? 'active' : ''}`}
            onClick={() => setActiveTab('airports')}
          >
            Nearby Airports
          </button>
        </div>
        <div className="player-info">
          <span className="balance">💰 {gameData?.gameProfile?.balance?.toLocaleString() || 0} ¥</span>
          <span className="level">👑 Level {gameData?.gameProfile?.level || 1}</span>
          <button onClick={fetchLeaderboard} className="leaderboard-btn">Leaderboard</button>
          {user.role === 'admin' && <Link to="/admin" className="admin-link">Admin Panel</Link>}
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="game-content">
        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-actions">
          <button className="action-btn" onClick={() => setShowTransactions(true)}>
            📋 Transaction History
          </button>
          <button className="action-btn" onClick={() => setShowUpgradePanel(true)}>
            🏗️ Upgrade Airport
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* 我的机场部分 */}
            <div className="airport-section">
              <h2>🏢 {gameData?.airports?.[0]?.name || `${user.username}'s Airport`}</h2>
              <div className="airport-details">
                <div className="airport-stat">
                  <span className="stat-label">Level:</span>
                  <span className="stat-value">{gameData?.airports?.[0]?.level || 1}</span>
                </div>
                <div className="airport-stat">
                  <span className="stat-label">Runways:</span>
                  <span className="stat-value">{gameData?.airports?.[0]?.runways?.length || 1}</span>
                </div>
                <div className="airport-stat">
                  <span className="stat-label">Parking Spots:</span>
                  <span className="stat-value">{gameData?.airports?.[0]?.parkingSpots?.length || 5}</span>
                </div>
                <div className="airport-facilities">
                  <h4>Facilities:</h4>
                  <div className="facilities-list">
                    {gameData?.airports?.[0]?.facilities?.map((facility, index) => (
                      <div key={index} className="facility-item">
                        <span className="facility-type">{facility.type}</span>
                        <span className="facility-level">Level {facility.level}</span>
                        <span className="facility-capacity">Capacity: {facility.capacity}</span>
                      </div>
                    )) || <p>No facilities available</p>}
                  </div>
                </div>
              </div>
              
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
                  <div className="fleet-summary">
                    <p>Total Aircraft: <strong>{gameData.aircraft.length}</strong></p>
                    <p>Parked: <strong>{gameData.aircraft.filter(a => a.status === 'parked').length}</strong></p>
                    <p>In Flight: <strong>{gameData.aircraft.filter(a => a.status === 'in-flight').length}</strong></p>
                    <button className="view-fleet-btn" onClick={() => setActiveTab('fleet')}>View Full Fleet</button>
                  </div>
                ) : (
                  <div className="no-planes">
                    <p>You don't have any aircraft yet.</p>
                    <button className="add-plane-btn" onClick={() => setShowAddPlaneForm(true)}>Buy Your First Aircraft</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'fleet' && (
          <div className="fleet-management">
            <h2>🛩️ Aircraft Fleet Management</h2>
            
            <button className="add-plane-btn" onClick={() => setShowAddPlaneForm(true)}>Buy New Aircraft</button>
            
            {gameData?.aircraft?.length > 0 ? (
              <div className="fleet-list">
                {gameData.aircraft.map(plane => (
                  <div key={plane._id} className={`plane-item ${plane.status}`}>
                    <PlaneDisplay model={plane.model} />
                    <div className="plane-details">
                      <div className="plane-name">{plane.name}</div>
                      <div className="plane-model">{plane.model}</div>
                      <div className="plane-status">Status: {plane.status}</div>
                      <div className="plane-specs">
                        <span>Capacity: {plane.capacity} passengers</span>
                        <span>Condition: {plane.condition}%</span>
                      </div>
                    </div>
                    <div className="plane-actions">
                      <button 
                        className="detail-btn"
                        onClick={() => handleShowAircraftDetail(plane)}
                      >
                        Details
                      </button>
                      {plane.status === 'parked' && (
                        <button 
                          className="route-btn"
                          onClick={() => handleShowRouteSetup(plane)}
                        >
                          Set Route
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-planes">
                <p>You don't have any aircraft yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'airports' && (
          <div className="airports-management">
            <h2>🌎 Nearby Airports</h2>
            
            {nearbyAirports.length > 0 ? (
              <div className="airports-grid">
                {nearbyAirports.map(airport => (
                  <div key={airport.id} className="nearby-airport-card">
                    <h4>{airport.name}</h4>
                    <div className="airport-info">
                      <p>Owner: {airport.ownerName}</p>
                      <p>Level: {airport.level}</p>
                      <p>Available Spots: {airport.availableSpots}</p>
                      <div className="fee-info">
                        <p>Parking Fees:</p>
                        <ul>
                          <li>Standard: {airport.parkingFees.standard}¥/day</li>
                          {airport.parkingFees.premium > 0 && 
                            <li>Premium: {airport.parkingFees.premium}¥/day</li>}
                          {airport.parkingFees.exclusive > 0 && 
                            <li>Exclusive: {airport.parkingFees.exclusive}¥/day</li>}
                        </ul>
                      </div>
                      <div className="facilities-preview">
                        <p>Facilities:</p>
                        <div className="facility-icons">
                          {airport.facilities.map((facility, idx) => (
                            <span key={idx} className="facility-badge">
                              {facility.type} (Lvl {facility.level})
                            </span>
                          ))}
                        </div>
                      </div>
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
        )}

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
                  <div className="model-specs">
                    <h4>Aircraft Specifications:</h4>
                    <table className="specs-table">
                      <tbody>
                        <tr>
                          <td>Capacity:</td>
                          <td>{
                            {
                              'ARJ21-700': '70 passengers',
                              'ARJ21-900': '90 passengers',
                              'C919-A': '150 passengers',
                              'C919-B': '180 passengers',
                              'A320': '200 passengers',
                              'A330': '300 passengers',
                              'A350': '350 passengers'
                            }[newPlane.model]
                          }</td>
                        </tr>
                        <tr>
                          <td>Maintenance Cost:</td>
                          <td>{
                            {
                              'ARJ21-700': '100¥ per day',
                              'ARJ21-900': '140¥ per day',
                              'C919-A': '180¥ per day',
                              'C919-B': '220¥ per day',
                              'A320': '250¥ per day',
                              'A330': '320¥ per day',
                              'A350': '380¥ per day'
                            }[newPlane.model]
                          }</td>
                        </tr>
                        <tr>
                          <td>Daily Income:</td>
                          <td>{
                            {
                              'ARJ21-700': '~200¥',
                              'ARJ21-900': '~300¥',
                              'C919-A': '~350¥',
                              'C919-B': '~450¥',
                              'A320': '~500¥',
                              'A330': '~600¥',
                              'A350': '~700¥'
                            }[newPlane.model]
                          }</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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

        {/* 停靠飞机的表单 */}
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
                  <label htmlFor="spotType">Spot Type:</label>
                  <select 
                    id="spotType"
                    value={parkingDetails.spotType || 'standard'}
                    onChange={(e) => setParkingDetails({...parkingDetails, spotType: e.target.value})}
                  >
                    <option value="standard">Standard ({selectedAirport.parkingFees.standard}¥/day)</option>
                    {selectedAirport.parkingFees.premium > 0 && 
                      <option value="premium">Premium ({selectedAirport.parkingFees.premium}¥/day)</option>}
                    {selectedAirport.parkingFees.exclusive > 0 && 
                      <option value="exclusive">Exclusive ({selectedAirport.parkingFees.exclusive}¥/day)</option>}
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
                  <p>🔄 You will pay a service fee to the airport owner (~300¥/day).</p>
                  <p>💰 In return, you'll receive random dividends (100-500¥/day) based on passenger traffic.</p>
                  <p>⏱️ Higher level airports and better facilities may yield higher dividends.</p>
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

        {/* 飞机详情弹窗 */}
        {showAircraftDetail && selectedAircraft && (
          <AircraftDetailView 
            aircraft={selectedAircraft}
            onClose={() => setShowAircraftDetail(false)}
            onSetRoute={() => {
              setShowAircraftDetail(false);
              setShowRouteModal(true);
            }}
          />
        )}

        {/* 飞机航线设置弹窗 */}
        {showRouteModal && selectedAircraft && (
          <RouteSetupModal 
            aircraft={selectedAircraft}
            airports={nearbyAirports}
            onClose={() => setShowRouteModal(false)}
            onSetRoute={handleSetRoute}
          />
        )}

        {/* 机场升级面板 */}
        {showUpgradePanel && gameData && (
          <AirportUpgradePanel
            airport={gameData.airports[0]}
            gameProfile={gameData.gameProfile}
            onClose={() => setShowUpgradePanel(false)}
            onUpgrade={handleUpgrade}
          />
        )}

        {/* 排行榜面板 */}
        {showLeaderboard && leaderboardData && (
          <LeaderboardPanel
            data={leaderboardData}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* 交易历史记录 */}
        {showTransactions && gameData && (
          <TransactionHistory
            transactions={gameData.transactions}
            onClose={() => setShowTransactions(false)}
          />
        )}
      </div>

      <footer className="game-footer">
        <p>&copy; {new Date().getFullYear()} Airport Tycoon Game | Created by AI Developer</p>
      </footer>
      
      {/* 添加全局样式用于图片降级处理 */}
      <style jsx global>{`
        .plane-display {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 50px;
        }
        
        .plane-display .emoji-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          z-index: 1;
        }
        
        .plane-display .plane-image {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
        }
        
        /* 当图片加载失败时隐藏图片 */
        .plane-display img[src=""], 
        .plane-display img:not([src]) {
          display: none;
        }
        
        /* 针对已知加载失败的图片直接显示emoji */
        .plane-emoji {
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
        }

        /* 导航样式 */
        .navigation-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .nav-tab {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background-color: #2c3e50;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
        }

        .nav-tab.active {
          background-color: #3498db;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        /* 操作按钮样式 */
        .dashboard-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .action-btn {
          padding: 10px 20px;
          background-color: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background-color: #2ecc71;
          transform: translateY(-2px);
        }

        /* 机场详情样式 */
        .airport-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
        }

        .airport-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background-color: rgba(52, 152, 219, 0.2);
          border-radius: 6px;
        }

        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }

        .airport-facilities {
          grid-column: 1 / -1;
        }

        .facilities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .facility-item {
          background-color: rgba(46, 204, 113, 0.2);
          border-radius: 6px;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
        }

        .facility-type {
          font-weight: bold;
          text-transform: capitalize;
        }

        /* 飞机列表改进 */
        .fleet-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .plane-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
          transition: transform 0.3s;
        }

        .plane-item:hover {
          transform: translateY(-5px);
        }

        .plane-item.in-flight {
          border-left: 4px solid #f39c12;
        }

        .plane-item.parked {
          border-left: 4px solid #2ecc71;
        }

        .plane-details {
          flex: 1;
        }

        .plane-name {
          font-weight: bold;
          font-size: 18px;
        }

        .plane-model {
          color: #7f8c8d;
        }

        .plane-status {
          margin-top: 5px;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          font-size: 12px;
          background-color: #34495e;
        }

        .plane-specs {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .plane-specs span {
          background-color: rgba(52, 152, 219, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        .plane-actions {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .plane-actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .detail-btn {
          background-color: #3498db;
          color: white;
        }

        .route-btn {
          background-color: #e74c3c;
          color: white;
        }

        /* 机场网格样式 */
        .airports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .nearby-airport-card {
          background-color: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 15px;
          transition: transform 0.3s;
        }

        .nearby-airport-card:hover {
          transform: translateY(-5px);
        }

        .facility-badge {
          background-color: rgba(46, 204, 113, 0.2);
          border-radius: 4px;
          padding: 3px 6px;
          margin-right: 5px;
          font-size: 12px;
          display: inline-block;
          margin-bottom: 5px;
          text-transform: capitalize;
        }

        /* 财务摘要样式 */
        .fleet-summary {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .view-fleet-btn {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default GameDashboard;
