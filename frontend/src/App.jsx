import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from './components/Card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faSun, faMountain } from '@fortawesome/free-solid-svg-icons';

// ==========================================================================
// 1. CONSTANTS & HELPER FUNCTIONS
// ==========================================================================
const API_URL = 'http://127.0.0.1:5000/api/landslide-risk';
const ITEMS_PER_PAGE = 6;
const DEFAULT_MAP_ZOOM = 9;
const SELECTED_CARD_ZOOM = 18;
const DEFAULT_MAP_CENTER = [3.116, 101.637];

const riskColors = {
  High: '#F50000',
  Moderate: '#F7B500',
  Low: '#008000',
  Default: '#6b7280'
};

const getRiskColor = (riskLevel) => riskColors[riskLevel] || riskColors.Default;

const getMarkerIcon = (color) => {
  return L.divIcon({
    className: `custom-marker-icon`,
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getCircleOptions = (riskLevel) => {
  let radius;
  switch (riskLevel) {
    case 'High':
      radius = 3000;
      break;
    case 'Moderate':
      radius = 2400;
      break;
    case 'Low':
      radius = 1600;
      break;
    default:
      radius = 200;
      break;
  }
  const color = getRiskColor(riskLevel);
  return { color, fillColor: color, fillOpacity: 0.5, radius };
};

// ==========================================================================
// 2. IMPERATIVE MAP COMPONENT
// ==========================================================================
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// ==========================================================================
// 3. MAIN APP COMPONENT
// ==========================================================================
function App() {
  // --- State Hooks ---
  const [landslideData, setLandslideData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterDay, setFilterDay] = useState('All');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [currentPage, setCurrentPage] = useState(1);
  const [riskCounts, setRiskCounts] = useState({ High: 0, Moderate: 0, Low: 0 });

  // --- Effects ---
  // Initial data fetch
  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLandslideData(sortedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  // Filter data and update risk counts whenever filters change
  useEffect(() => {
    let currentFilteredData = landslideData;
    if (selectedRegion !== 'All') currentFilteredData = currentFilteredData.filter(item => item.regionName === selectedRegion);
    if (selectedRiskLevel !== 'All') currentFilteredData = currentFilteredData.filter(item => item.calculatedRiskLevel === selectedRiskLevel);
    if (filterYear !== 'All') currentFilteredData = currentFilteredData.filter(item => new Date(item.timestamp).getFullYear().toString() === filterYear);
    if (filterMonth !== 'All') currentFilteredData = currentFilteredData.filter(item => (new Date(item.timestamp).getMonth() + 1).toString() === filterMonth);
    if (filterDay !== 'All') currentFilteredData = currentFilteredData.filter(item => new Date(item.timestamp).getDate().toString() === filterDay);
    
    setFilteredData(currentFilteredData);
    setCurrentPage(1); // Reset to page 1 whenever filters change
    
    const counts = { High: 0, Moderate: 0, Low: 0 };
    currentFilteredData.forEach(item => {
      if (item.calculatedRiskLevel === 'High') counts.High++;
      else if (item.calculatedRiskLevel === 'Moderate') counts.Moderate++;
      else if (item.calculatedRiskLevel === 'Low') counts.Low++;
    });
    setRiskCounts(counts);

    // Deselect card if it's no longer in the filtered data
    if (selectedCard && !currentFilteredData.find(item => item.timestamp === selectedCard.timestamp)) {
      setSelectedCard(null);
      setMapZoom(DEFAULT_MAP_ZOOM);
    }
  }, [landslideData, selectedRegion, selectedRiskLevel, filterYear, filterMonth, filterDay, selectedCard]);

  // Deselect card when the page changes
  useEffect(() => {
    setSelectedCard(null);
  }, [currentPage]);

  // --- Memoized Handlers and Values ---
  const handleCardClick = useCallback((cardData) => {
    if (selectedCard?.timestamp === cardData.timestamp) {
      setSelectedCard(null);
      setMapZoom(DEFAULT_MAP_ZOOM);
    } else {
      setSelectedCard(cardData);
      setMapZoom(SELECTED_CARD_ZOOM);
    }
  }, [selectedCard]);

  const handleClearFilters = useCallback(() => {
    setSelectedRegion('All');
    setSelectedRiskLevel('All');
    setFilterYear('All');
    setFilterMonth('All');
    setFilterDay('All');
    setSelectedCard(null);
    setMapZoom(DEFAULT_MAP_ZOOM);
    setCurrentPage(1);
  }, []);

  const mapCenter = useMemo(() => selectedCard ? [selectedCard.lat, selectedCard.lng] : DEFAULT_MAP_CENTER, [selectedCard]);
  const uniqueRegions = useMemo(() => ['All', ...new Set(landslideData.map(item => item.regionName))].sort(), [landslideData]);
  const uniqueYears = useMemo(() => ['All', ...new Set(landslideData.map(item => new Date(item.timestamp).getFullYear().toString()))].sort((a,b) => b-a), [landslideData]);
  const riskLevels = useMemo(() => ['All', 'Low', 'Moderate', 'High'], []);
  const months = useMemo(() => [
    { value: 'All', label: 'All' }, { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' }, { value: '5', label: 'May' },
    { value: '6', label: 'June' }, { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ], []);

  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const days = useMemo(() => {
    const year = filterYear !== 'All' ? parseInt(filterYear, 10) : new Date().getFullYear();
    const month = filterMonth !== 'All' ? parseInt(filterMonth, 10) : new Date().getMonth() + 1;
    return ['All', ...Array.from({ length: daysInMonth(year, month) }, (_, i) => (i + 1).toString())];
  }, [filterYear, filterMonth]);
  
  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: Failed to fetch data. Please ensure the backend is running.</div>;

  // --- JSX Rendering ---
  return (
    <div className="app">
      {/* Header and Filter Section */}
      <div className="sticky-header-section">
        <div className="header-card-wrapper">
          <header><h1>Landslide Monitoring Dashboard</h1></header>
          <div className="summary-cards">
            <div className="summary-card high-risk"><h3>High Risk</h3><p>{riskCounts.High}</p></div>
            <div className="summary-card moderate-risk"><h3>Moderate Risk</h3><p>{riskCounts.Moderate}</p></div>
            <div className="summary-card low-risk"><h3>Low Risk</h3><p>{riskCounts.Low}</p></div>
          </div>
          <div className="filters">
            {/* Region Filter */}
            <div className="filter-group">
              <label htmlFor="region-select">Region:</label>
              <select id="region-select" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                {uniqueRegions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
            {/* Risk Level Filter */}
            <div className="filter-group">
              <label htmlFor="risk-select">Risk Level:</label>
              <select id="risk-select" value={selectedRiskLevel} onChange={(e) => setSelectedRiskLevel(e.target.value)}>
                {riskLevels.map(risk => <option key={risk} value={risk}>{risk}</option>)}
              </select>
            </div>
            {/* Year Filter */}
            <div className="filter-group">
              <label htmlFor="year-select">Year:</label>
              <select id="year-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            {/* Month Filter */}
            <div className="filter-group">
              <label htmlFor="month-select">Month:</label>
              <select id="month-select" value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDay('All'); }}>
                {months.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            </div>
            {/* Day Filter */}
            <div className="filter-group">
              <label htmlFor="day-select">Day:</label>
              <select id="day-select" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                {days.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            {/* Clear Filters Button */}
            <div className="filter-group">
              <button className="clear-button" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content: Dashboard and Map */}
      <div className="main-content">
        {/* Dashboard Section */}
        <div className="dashboard-content">
          <div className="dashboard-header"><h2>Recent Monitoring Data</h2></div>
          <div className="dashboard-grid">
            {paginatedData.length > 0 ? (
              paginatedData.map(item => (
                <Card 
                  key={item.timestamp} 
                  data={item} 
                  onClick={handleCardClick}
                  isSelected={selectedCard?.timestamp === item.timestamp}
                  riskColors={riskColors} 
                />
              ))
            ) : (
              <p className="no-data-message">No data found for the selected filters. Try adjusting your filters.</p>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="pagination-buttons">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
              </div>
            </div>
          )}
        </div>
        
        {/* Map Section */}
        <div className="map-container">
          <div className="map-info">
            <h3>Overview Map</h3>
            {selectedCard && (
              <div className="selected-card-details">
                <p><strong style={{ color: getRiskColor(selectedCard.calculatedRiskLevel) }}>{selectedCard.regionName} - {selectedCard.calculatedRiskLevel} Risk</strong></p>
                <p>Rainfall: {selectedCard.rainfallLevel} mm | Soil: {selectedCard.soilSaturation}% | Slope: {selectedCard.slopeAngle}°</p>
              </div>
            )}
          </div>
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="main-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            {paginatedData.map(item => {
              if (item.lat && item.lng) {
                const isSelected = selectedCard?.timestamp === item.timestamp;
                const markerIcon = getMarkerIcon(getRiskColor(item.calculatedRiskLevel));
                return (
                  <React.Fragment key={item.timestamp}>
                    <Marker position={[item.lat, item.lng]} icon={markerIcon}>
                      <Popup>{item.regionName}</Popup>
                    </Marker>
                    {isSelected && (
                      <Circle
                        center={[item.lat, item.lng]}
                        pathOptions={getCircleOptions(item.calculatedRiskLevel)}
                      />
                    )}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default App;