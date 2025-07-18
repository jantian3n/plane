import React from 'react';
import '../styles/AircraftDetailView.css';

const AircraftDetailView = ({ aircraft, onClose, onSetRoute }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content aircraft-detail">
        <div className="modal-header">
          <h3>Aircraft Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="aircraft-detail-content">
          <div className="aircraft-header">
            <div className="aircraft-icon">✈️</div>
            <div className="aircraft-title">
              <h2>{aircraft.name}</h2>
              <p className="aircraft-model">{aircraft.model}</p>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Technical Specifications</h4>
            <table className="detail-table">
              <tbody>
                <tr>
                  <td>Capacity:</td>
                  <td>{aircraft.capacity} passengers</td>
                </tr>
                <tr>
                  <td>Purchase Price:</td>
                  <td>{aircraft.purchasePrice?.toLocaleString() || "N/A"} ¥</td>
                </tr>
                <tr>
                  <td>Maintenance Cost:</td>
                  <td>{aircraft.maintenanceCost} ¥/day</td>
                </tr>
                <tr>
                  <td>Condition:</td>
                  <td>
                    <div className="condition-bar">
                      <div 
                        className="condition-fill" 
                        style={{width: `${aircraft.condition}%`, 
                        backgroundColor: 
                          aircraft.condition > 70 ? '#2ecc71' : 
                          aircraft.condition > 40 ? '#f39c12' : 
                          '#e74c3c'
                        }}
                      ></div>
                      <span className="condition-text">{aircraft.condition}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="detail-section">
            <h4>Status Information</h4>
            <table className="detail-table">
              <tbody>
                <tr>
                  <td>Current Status:</td>
                  <td><span className={`status-badge ${aircraft.status}`}>{aircraft.status}</span></td>
                </tr>
                <tr>
                  <td>Current Location:</td>
                  <td>{aircraft.currentLocationName || "Home Airport"}</td>
                </tr>
                {aircraft.activeRoute && (
                  <>
                    <tr>
                      <td>Flight Route:</td>
                      <td>{aircraft.activeRoute.source} → {aircraft.activeRoute.destination}</td>
                    </tr>
                    <tr>
                      <td>Departure:</td>
                      <td>{new Date(aircraft.activeRoute.departureTime).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Arrival:</td>
                      <td>{new Date(aircraft.activeRoute.arrivalTime).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Expected Revenue:</td>
                      <td>{aircraft.activeRoute.income?.toLocaleString() || "N/A"} ¥</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="detail-actions">
            {aircraft.status === 'parked' && (
              <button onClick={onSetRoute} className="action-button route-button">
                Set Flight Route
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AircraftDetailView;
