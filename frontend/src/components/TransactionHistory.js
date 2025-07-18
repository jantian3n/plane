import React, { useState } from 'react';
import '../styles/TransactionHistory.css';

const TransactionHistory = ({ transactions, onClose }) => {
  const [filter, setFilter] = useState('all');
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content transaction-history">
          <div className="modal-header">
            <h3>Transaction History</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="empty-transactions">
            <p>No transactions found</p>
          </div>
        </div>
      </div>
    );
  }
  
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);
  
  return (
    <div className="modal-overlay">
      <div className="modal-content transaction-history">
        <div className="modal-header">
          <h3>Transaction History</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'purchase' ? 'active' : ''}`}
            onClick={() => setFilter('purchase')}
          >
            Purchases
          </button>
          <button 
            className={`filter-btn ${filter === 'parking-fee' ? 'active' : ''}`}
            onClick={() => setFilter('parking-fee')}
          >
            Parking Fees
          </button>
          <button 
            className={`filter-btn ${filter === 'service' ? 'active' : ''}`}
            onClick={() => setFilter('service')}
          >
            Service Income
          </button>
          <button 
            className={`filter-btn ${filter === 'upgrade' ? 'active' : ''}`}
            onClick={() => setFilter('upgrade')}
          >
            Upgrades
          </button>
        </div>
        
        <div className="transaction-list">
          {filteredTransactions.map((transaction, index) => (
            <div key={index} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-icon">
                {transaction.type === 'purchase' ? '🛒' : 
                 transaction.type === 'parking-fee' ? '🅿️' :
                 transaction.type === 'service' ? '💰' :
                 transaction.type === 'upgrade' ? '🏗️' : '💱'}
              </div>
              
              <div className="transaction-details">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-meta">
                  {transaction.from && transaction.to ? (
                    <span className="transaction-users">
                      {transaction.from.username} → {transaction.to.username}
                    </span>
                  ) : (
                    <span className="transaction-users">System Transaction</span>
                  )}
                  
                  <span className="transaction-time">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className={`transaction-amount ${transaction.to?.username === transaction.currentUser ? 'income' : 'expense'}`}>
                {transaction.to?.username === transaction.currentUser ? '+' : '-'}{transaction.amount.toLocaleString()}¥
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
