import React, { useState, useEffect } from 'react';
import '../styles/RouteSetupModal.css';

const RouteSetupModal = ({ aircraft, airports, onClose, onSetRoute }) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [estimatedFlightTime, setEstimatedFlightTime] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // 设置默认起飞时间为一小时后
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    setDepartureTime(now.toISOString().slice(0, 16));
  }, []);
  
  // 计算预估收入和飞行时间
  const calculateEstimates = (destinationId) => {
    if (!destinationId) return;
    
    const destination = airports.find(a => a.id === destinationId);
    if (!destination) return;
    
    // 这里只是一个模拟的计算，实际会由后端计算
    // 假设已知当前位置和目的地位置
    const x1 = 500; // 当前位置 x (假设值)
    const y1 = 500; // 当前位置 y (假设值)
    const x2 = destination.location.x;
    const y2 = destination.location.y;
    
    // 计算距离
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // 计算飞行时间（每100单位距离1小时）
    const flightTime = distance / 100;
    setEstimatedFlightTime(flightTime);
    
    // 计算预估收入
    // 基于飞机型号的每小时收入
    const hourlyIncomes = {
      'ARJ21-700': 200/24,
      'ARJ21-900': 300/24,
      'C919-A': 350/24,
      'C919-B': 450/24,
      'A320': 500/24,
      'A330': 600/24,
      'A350': 700/24
    };
    
    const hourlyIncome = hourlyIncomes[aircraft.model] || 20;
    const income = Math.floor(hourlyIncome * flightTime * (0.8 + Math.random() * 0.4));
    setEstimatedIncome(income);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 调用父组件的函数来设置航线
    onSetRoute(aircraft._id, selectedDestination, departureTime)
      .finally(() => setLoading(false));
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content route-modal">
        <div className="modal-header">
          <h3>Set Flight Route: {aircraft.name}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="route-form">
          <div className="aircraft-info">
            <div className="info-label">Aircraft:</div>
            <div className="info-value">{aircraft.name} ({aircraft.model})</div>
            <div className="info-label">Capacity:</div>
            <div className="info-value">{aircraft.capacity} passengers</div>
            <div className="info-label">Current Location:</div>
            <div className="info-value">
              {aircraft.currentLocationName || "Your Airport"}
            </div>
          </div>
          
          <div className="form-group">
            <label>Select Destination Airport:</label>
            <select 
              value={selectedDestination} 
              onChange={(e) => {
                setSelectedDestination(e.target.value);
                calculateEstimates(e.target.value);
              }}
              required
            >
              <option value="">-- Select Destination --</option>
              {airports.map(airport => (
                <option key={airport.id} value={airport.id}>
                  {airport.name} (Owner: {airport.ownerName}, Level: {airport.level})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Departure Time:</label>
            <input 
              type="datetime-local" 
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              required
              min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
            />
          </div>
          
          {selectedDestination && (
            <div className="route-estimates">
              <h4>Flight Estimates:</h4>
              <div className="estimate-item">
                <div className="estimate-label">Flight Time:</div>
                <div className="estimate-value">{estimatedFlightTime.toFixed(1)} hours</div>
              </div>
              <div className="estimate-item">
                <div className="estimate-label">Estimated Revenue:</div>
                <div className="estimate-value">{estimatedIncome} ¥</div>
              </div>
              <div className="estimate-item">
                <div className="estimate-label">Arrival Time:</div>
                <div className="estimate-value">
                  {departureTime ? new Date(new Date(departureTime).getTime() + estimatedFlightTime * 60 * 60 * 1000).toLocaleString() : '--'}
                </div>
              </div>
              <div className="estimate-note">
                * Actual revenue may vary based on passenger demand and other factors
              </div>
            </div>
          )}
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!selectedDestination || !departureTime || loading}
            >
              {loading ? 'Setting Route...' : 'Confirm Flight Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteSetupModal;
