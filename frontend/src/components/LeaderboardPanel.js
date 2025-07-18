import React, { useState } from 'react';

const LeaderboardPanel = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState('wealth');
  
  if (!data) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Leaderboard</h3>
          <p style={{textAlign: 'center', padding: '20px'}}>No leaderboard data available</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Leaderboard</h3>
        
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
          <button 
            style={{
              padding: '8px', 
              background: activeTab === 'wealth' ? '#3498db' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('wealth')}
          >
            Wealthiest Players
          </button>
          <button 
            style={{
              padding: '8px', 
              background: activeTab === 'airports' ? '#3498db' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('airports')}
          >
            Top Airports
          </button>
          <button 
            style={{
              padding: '8px', 
              background: activeTab === 'fleets' ? '#3498db' : '#34495e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('fleets')}
          >
            Largest Fleets
          </button>
        </div>
        
        <div style={{margin: '20px 0', maxHeight: '400px', overflowY: 'auto'}}>
          {activeTab === 'wealth' && (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Rank</th>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Player</th>
                  <th style={{textAlign: 'right', padding: '8px', borderBottom: '1px solid #34495e'}}>Balance</th>
                  <th style={{textAlign: 'center', padding: '8px', borderBottom: '1px solid #34495e'}}>Level</th>
                </tr>
              </thead>
              <tbody>
                {data.wealth.map((player, idx) => (
                  <tr key={idx} style={{backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
                    <td style={{padding: '8px'}}>{idx + 1}</td>
                    <td style={{padding: '8px'}}>{player.username}</td>
                    <td style={{padding: '8px', textAlign: 'right'}}>{player.balance.toLocaleString()} ¥</td>
                    <td style={{padding: '8px', textAlign: 'center'}}>{player.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {activeTab === 'airports' && (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Rank</th>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Airport</th>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Owner</th>
                  <th style={{textAlign: 'center', padding: '8px', borderBottom: '1px solid #34495e'}}>Level</th>
                </tr>
              </thead>
              <tbody>
                {data.airports.map((airport, idx) => (
                  <tr key={idx} style={{backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
                    <td style={{padding: '8px'}}>{idx + 1}</td>
                    <td style={{padding: '8px'}}>{airport.airportName}</td>
                    <td style={{padding: '8px'}}>{airport.ownerName}</td>
                    <td style={{padding: '8px', textAlign: 'center'}}>{airport.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {activeTab === 'fleets' && (
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Rank</th>
                  <th style={{textAlign: 'left', padding: '8px', borderBottom: '1px solid #34495e'}}>Player</th>
                  <th style={{textAlign: 'center', padding: '8px', borderBottom: '1px solid #34495e'}}>Aircraft Count</th>
                </tr>
              </thead>
              <tbody>
                {data.fleets.map((fleet, idx) => (
                  <tr key={idx} style={{backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
                    <td style={{padding: '8px'}}>{idx + 1}</td>
                    <td style={{padding: '8px'}}>{fleet.username}</td>
                    <td style={{padding: '8px', textAlign: 'center'}}>{fleet.aircraftCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <button 
          onClick={onClose}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPanel;
