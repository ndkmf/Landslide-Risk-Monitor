import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [landslideData, setLandslideData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const [selectedRegion, setSelectedRegion] = useState('All'); // New state for region filter
  const [filterDate, setFilterDate] = useState(''); // New state for date filter (placeholder)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from your Flask backend
    fetch('http://127.0.0.1:5000/api/landslide-risk')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setLandslideData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  // Effect to apply filters whenever landslideData, selectedRegion, or filterDate changes
  useEffect(() => {
    let currentFilteredData = landslideData;

    // Apply region filter
    if (selectedRegion !== 'All') {
      currentFilteredData = currentFilteredData.filter(
        (region) => region.regionName === selectedRegion
      );
    }

    // Apply date filter (placeholder for future implementation)
    // if (filterDate) {
    //   currentFilteredData = currentFilteredData.filter(
    //     (region) => region.timestamp === filterDate // Assuming timestamp format matches
    //   );
    // }

    setFilteredData(currentFilteredData);
  }, [landslideData, selectedRegion, filterDate]); // Dependencies for this effect

  // A function to determine the color based on risk level
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'red';
      case 'Moderate':
        return 'orange';
      case 'Low':
        return 'green';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (error) {
    return <div className="error">Error: Failed to fetch data. Please ensure the backend is running.</div>;
  }

  // Get unique region names for the dropdown
  const uniqueRegions = ['All', ...new Set(landslideData.map(item => item.regionName))].sort();

  return (
    <div className="app">
      <header>
        <h1>Landslide Risk Monitor</h1>
      </header>
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="region-select">Filter by Region:</label>
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
          <label htmlFor="date-input">Filter by Date (Placeholder):</label>
          <input
            id="date-input"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            disabled // Disable for now as backend doesn't support dynamic dates
          />
        </div>
      </div>
      <div className="dashboard">
        {filteredData.length > 0 ? (
          filteredData.map((region, index) => (
            <div key={index} className="card" style={{ borderLeft: `5px solid ${getRiskColor(region.calculatedRiskLevel)}` }}>
              <h3>{region.regionName}</h3>
              <p><strong>Rainfall:</strong> {region.rainfallLevel} mm</p>
              <p><strong>Soil Saturation:</strong> {region.soilSaturation}%</p>
              <p><strong>Slope Angle:</strong> {region.slopeAngle}°</p>
              <p>
                <strong>Risk Level:</strong>
                <span className="risk-level" style={{ color: getRiskColor(region.calculatedRiskLevel) }}>
                  {region.calculatedRiskLevel}
                </span>
              </p>
              <p><small>Data as of: {region.timestamp}</small></p>
            </div>
          ))
        ) : (
          <p>No data found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}

export default App;