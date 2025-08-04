import { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faSun, faMountain, faTimes } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [landslideData, setLandslideData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/landslide-risk')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const sortedData = data.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLandslideData(sortedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let currentFilteredData = landslideData;

    if (selectedRegion !== 'All') {
      currentFilteredData = currentFilteredData.filter(
        (item) => item.regionName === selectedRegion
      );
    }

    if (filterDate) {
      currentFilteredData = currentFilteredData.filter(
        (item) => item.timestamp === filterDate
      );
    }

    if (selectedRiskLevel !== 'All') {
        currentFilteredData = currentFilteredData.filter(
            (item) => item.calculatedRiskLevel === selectedRiskLevel
        );
    }

    setFilteredData(currentFilteredData);
  }, [landslideData, selectedRegion, filterDate, selectedRiskLevel]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'var(--color-danger)';
      case 'Moderate':
        return 'var(--color-warning)';
      case 'Low':
        return 'var(--color-success)';
      default:
        return 'var(--color-text-secondary)';
    }
  };

  const handleCardClick = (regionData) => {
    setModalData(regionData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (error) {
    return <div className="error">Error: Failed to fetch data. Please ensure the backend is running.</div>;
  }

  const uniqueRegions = ['All', ...new Set(landslideData.map(item => item.regionName))].sort();
  const riskLevels = ['All', 'Low', 'Moderate', 'High'];

  return (
    <div className="app">
      {/* New container for the fixed header card */}
      <div className="layout-fixed">
        <div className="header-card-wrapper">
          <header>
            <h1>Landslide Risk Monitor</h1>
          </header>
          <div className="filters">
            <div className="filter-group">
              <label htmlFor="region-select">Region:</label>
              <select
                id="region-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="risk-select">Risk Level:</label>
              <select
                id="risk-select"
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
              >
                {riskLevels.map((risk) => (
                  <option key={risk} value={risk}>
                    {risk}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="date-input">Date:</label>
              <input
                id="date-input"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard">
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={index}
              className="card"
              onClick={() => handleCardClick(item)}
            >
              <div
                className="risk-stripe"
                style={{ backgroundColor: getRiskColor(item.calculatedRiskLevel) }}
              ></div>
              <h3>{item.regionName}</h3>
              <p className="card-detail rainfall">
                <FontAwesomeIcon icon={faCloudRain} />
                <span className="detail-label">Rainfall:</span> 
                {item.rainfallLevel}mm
              </p>
              <p className="card-detail soil">
                <FontAwesomeIcon icon={faSun} />
                <span className="detail-label">Soil Saturation:</span> 
                {item.soilSaturation}%
              </p>
              <p className="card-detail slope">
                <FontAwesomeIcon icon={faMountain} />
                <span className="detail-label">Slope Angle:</span> 
                {item.slopeAngle}°
              </p>
              <div className="risk-indicator" style={{ backgroundColor: getRiskColor(item.calculatedRiskLevel) }}>
                <span className="risk-text">Risk Level:</span>
                <span className="risk-level">{item.calculatedRiskLevel}</span>
              </div>
              <p className="timestamp"><small>Data as of: {item.timestamp}</small></p>
            </div>
          ))
        ) : (
          <p className="no-data-message">No data found for the selected filters. Try adjusting your filters.</p>
        )}
      </div>

      {isModalOpen && modalData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 style={{ color: getRiskColor(modalData.calculatedRiskLevel) }}>{modalData.regionName}</h2>
            <div className="modal-details">
              <p><strong>Rainfall: </strong> {modalData.rainfallLevel}mm</p>
              <p><strong>Soil Saturation: </strong> {modalData.soilSaturation}%</p>
              <p><strong>Slope Angle: </strong> {modalData.slopeAngle}°</p>
              <p><strong>Risk Level: </strong> 
                <span 
                  className="risk-level-modal" 
                  style={{ color: getRiskColor(modalData.calculatedRiskLevel) }}
                >
                  {modalData.calculatedRiskLevel}
                </span>
              </p>
              <p><strong>Timestamp:</strong> {modalData.timestamp}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;