import React, { useMemo } from 'react';
import './Card.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faSun, faMountain } from '@fortawesome/free-solid-svg-icons';

// ==========================================================================
// CARD COMPONENT
// ==========================================================================
const Card = ({ data, onClick, isSelected, riskColors = {} }) => {
  // --- Memoized Logic ---
  // Calculates the risk color and memoizes it for performance
  const riskColor = useMemo(() => {
    return riskColors[data.calculatedRiskLevel] || riskColors.Default;
  }, [data.calculatedRiskLevel, riskColors]);

  // --- JSX Structure ---
  return (
    <div 
      className={`card ${isSelected ? 'selected' : ''}`} 
      onClick={() => onClick(data)}
    >
      {/* Risk Stripe */}
      <div 
        className="card-risk-stripe" 
        style={{ backgroundColor: riskColor }}>
      </div>

      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-title">{data.regionName}</h3>
        <span 
          className="risk-level" 
          style={{ backgroundColor: riskColor }}>
          {data.calculatedRiskLevel}
        </span>
      </div>
      
      {/* Card Body */}
      <div className="card-body">
        {/* Rainfall */}
        <div className="card-item">
          <FontAwesomeIcon icon={faCloudRain} className="icon" />
          <div className="item-details">
            <span className="item-label">Rainfall:</span>
            <span className="item-value">{data.rainfallLevel} mm</span>
          </div>
        </div>
        
        {/* Soil Saturation */}
        <div className="card-item">
          <FontAwesomeIcon icon={faSun} className="icon" />
          <div className="item-details">
            <span className="item-label">Soil Saturation:</span>
            <span className="item-value">{data.soilSaturation}%</span>
          </div>
        </div>
        
        {/* Slope Angle */}
        <div className="card-item">
          <FontAwesomeIcon icon={faMountain} className="icon" />
          <div className="item-details">
            <span className="item-label">Slope Angle:</span>
            <span className="item-value">{data.slopeAngle}°</span>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="card-footer">
        <span className="timestamp">{data.timestamp}</span>
      </div>
    </div>
  );
};

export default Card;