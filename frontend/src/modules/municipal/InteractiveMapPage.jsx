import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../../core/auth/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ChevronLeft, MapPin, Search, Layers, Info,
  AlertCircle, CheckCircle, Clock, Wrench,
  Satellite, Map as MapIconToggle, User
} from 'lucide-react';
import '../DomainDashboard.css';
import './Municipal.css';

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color) => L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="
    background: ${color};
    width: 28px;
    height: 28px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
  "><div style="
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  "></div></div>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

const markerColors = {
  roads: '#e74c3c',
  lighting: '#f39c12',
  water: '#3498db',
  sewage: '#8e44ad',
  garbage: '#27ae60',
  parks: '#2ecc71',
  noise: '#e67e22',
  encroachment: '#95a5a6',
  other: '#7f8c8d',
};

const statusColors = {
  'Submitted': '#e74c3c',
  'Acknowledged': '#f39c12',
  'In Progress': '#3498db',
  'Resolved': '#27ae60',
};

const statusIcons = {
  'Submitted': AlertCircle,
  'Acknowledged': Clock,
  'In Progress': Wrench,
  'Resolved': CheckCircle,
};

// Dummy issues with real lat/lng (Hyderabad area)
const allIssues = [
  { id: 1, lat: 17.3850, lng: 78.4867, title: 'Road Damage on Main Street', status: 'In Progress', type: 'roads', locality: 'Ameerpet', description: 'Large pothole near metro station', reportedBy: 'Citizen', date: '2026-02-25' },
  { id: 2, lat: 17.4400, lng: 78.4980, title: 'Street Light Not Working', status: 'Submitted', type: 'lighting', locality: 'Secunderabad', description: 'Multiple street lights out on Ring Road', reportedBy: 'Citizen', date: '2026-02-27' },
  { id: 3, lat: 17.3616, lng: 78.4747, title: 'Water Pipeline Leak', status: 'Resolved', type: 'water', locality: 'Mehdipatnam', description: 'Major water leak at junction', reportedBy: 'Citizen', date: '2026-02-20' },
  { id: 4, lat: 17.4260, lng: 78.4530, title: 'Garbage Accumulation', status: 'Acknowledged', type: 'garbage', locality: 'Begumpet', description: 'Waste not collected for 3 days', reportedBy: 'Citizen', date: '2026-02-28' },
  { id: 5, lat: 17.3950, lng: 78.5340, title: 'Sewage Overflow', status: 'In Progress', type: 'sewage', locality: 'Uppal', description: 'Sewage water flooding residential area', reportedBy: 'Citizen', date: '2026-02-26' },
  { id: 6, lat: 17.4480, lng: 78.3910, title: 'Park Maintenance Needed', status: 'Submitted', type: 'parks', locality: 'HITEC City', description: 'Broken swings and overgrown shrubs', reportedBy: 'Citizen', date: '2026-02-27' },
  { id: 7, lat: 17.3750, lng: 78.5230, title: 'Noise from Construction', status: 'Acknowledged', type: 'noise', locality: 'LB Nagar', description: 'Late-night construction activity', reportedBy: 'Citizen', date: '2026-02-28' },
  { id: 8, lat: 17.4100, lng: 78.4480, title: 'Encroachment on Footpath', status: 'Submitted', type: 'encroachment', locality: 'Panjagutta', description: 'Vendors blocking pedestrian path', reportedBy: 'Citizen', date: '2026-02-26' },
];

const infraItems = [
  { id: 'i1', lat: 17.3990, lng: 78.4790, title: 'Water Treatment Plant', type: 'water', status: 'Operational', capacity: '500 MLD' },
  { id: 'i2', lat: 17.4320, lng: 78.4650, title: 'Waste Processing Center', type: 'garbage', status: 'Operational', capacity: '200 tons/day' },
  { id: 'i3', lat: 17.3700, lng: 78.4900, title: 'Sewage Treatment Unit', type: 'sewage', status: 'Under Maintenance', capacity: '100 MLD' },
];

// Mock geocoding for demonstration
const locationCoordinates = {
  'hyderabad': [17.3850, 78.4867],
  'bangalore': [12.9716, 77.5946],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'chennai': [13.0827, 80.2707],
};

// Component to fly to a marker
function FlyToMarker({ position }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 14, { duration: 1.5 });
  }
  return null;
}

export function InteractiveMapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('issues');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [flyTo, setFlyTo] = useState(null);
  const [satelliteView, setSatelliteView] = useState(true);
  const mapRef = useRef(null);

  const userCoords = useMemo(() => {
    if (!user?.location) return [17.3850, 78.4867];
    const loc = user.location.toLowerCase();
    for (const [city, coords] of Object.entries(locationCoordinates)) {
      if (loc.includes(city)) return coords;
    }
    return [17.3850, 78.4867];
  }, [user]);

  const filteredIssues = allIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.locality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || issue.type === filterType;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setFlyTo([issue.lat, issue.lng]);
  };

  const center = userCoords;

  return (
    <div className="municipal-dashboard">
      <header className="page-header header-no-wrap">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/municipal')}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Interactive Map</h1>
            <p className="page-description">Real-time view of civic issues in your city</p>
          </div>
        </div>
      </header>

      <div className="map-view-container">
        <aside className="map-sidebar">
          <div className="search-box mb-md">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search issues or locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="map-tabs">
            <button
              className={`map-tab ${activeTab === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues')}
            >
              Issues ({filteredIssues.length})
            </button>
            <button
              className={`map-tab ${activeTab === 'infra' ? 'active' : ''}`}
              onClick={() => setActiveTab('infra')}
            >
              Infrastructure
            </button>
          </div>

          {activeTab === 'issues' && (
            <div className="map-filters">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="map-filter-select"
              >
                <option value="all">All Types</option>
                <option value="roads">Roads</option>
                <option value="lighting">Lighting</option>
                <option value="water">Water</option>
                <option value="sewage">Sewage</option>
                <option value="garbage">Garbage</option>
                <option value="parks">Parks</option>
                <option value="noise">Noise</option>
                <option value="encroachment">Encroachment</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="map-filter-select"
              >
                <option value="all">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Acknowledged">Acknowledged</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          )}

          <div className="map-items-list">
            {activeTab === 'issues' ? (
              filteredIssues.length > 0 ? (
                filteredIssues.map(issue => {
                  const StatusIcon = statusIcons[issue.status] || AlertCircle;
                  return (
                    <div
                      key={issue.id}
                      className={`map-item-card ${selectedIssue?.id === issue.id ? 'active' : ''}`}
                      onClick={() => handleIssueClick(issue)}
                    >
                      <div
                        className="status-dot-colored"
                        style={{ background: markerColors[issue.type] }}
                      />
                      <div className="item-info">
                        <strong>{issue.title}</strong>
                        <p>
                          <StatusIcon size={12} style={{ color: statusColors[issue.status] }} />
                          {' '}{issue.status} • {issue.locality}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-text">No issues match your filters</p>
              )
            ) : (
              infraItems.map(item => (
                <div
                  key={item.id}
                  className={`map-item-card`}
                  onClick={() => setFlyTo([item.lat, item.lng])}
                >
                  <div
                    className="status-dot-colored"
                    style={{ background: markerColors[item.type] }}
                  />
                  <div className="item-info">
                    <strong>{item.title}</strong>
                    <p>{item.status} • Capacity: {item.capacity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="map-canvas">
          <div className="map-toolbar floating">
            <button
              className={`map-view-toggle ${!satelliteView ? 'active' : ''}`}
              onClick={() => setSatelliteView(false)}
            >
              <MapIconToggle size={14} /> Street
            </button>
            <button
              className={`map-view-toggle ${satelliteView ? 'active' : ''}`}
              onClick={() => setSatelliteView(true)}
            >
              <Satellite size={14} /> Satellite
            </button>
          </div>
          <MapContainer
            center={center}
            zoom={12}
            style={{ width: '100%', height: '100%', borderRadius: '12px' }}
            ref={mapRef}
            zoomControl={true}
          >
            {satelliteView ? (
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {flyTo && <FlyToMarker position={flyTo} />}

            {/* User Location Marker */}
            {userCoords && (
              <Marker 
                position={userCoords} 
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `<div style="
                    background: linear-gradient(135deg, #6366f1, #a855f7);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>
                  <div className="leaflet-popup-content-inner">
                    <h4>Your Location</h4>
                    <p className="popup-description">{user?.location || 'Searching...'}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Issue markers */}
            {activeTab === 'issues' && filteredIssues.map(issue => (
              <Marker
                key={issue.id}
                position={[issue.lat, issue.lng]}
                icon={createColoredIcon(markerColors[issue.type])}
                eventHandlers={{
                  click: () => setSelectedIssue(issue),
                }}
              >
                <Popup>
                  <div className="leaflet-popup-content-inner">
                    <h4>{issue.title}</h4>
                    <p className="popup-description">{issue.description}</p>
                    <div className="popup-meta">
                      <span className="popup-status" style={{ color: statusColors[issue.status] }}>
                        ● {issue.status}
                      </span>
                      <span className="popup-locality">
                        <MapPin size={12} /> {issue.locality}
                      </span>
                    </div>
                    <p className="popup-date">Reported on {issue.date}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Infrastructure markers */}
            {activeTab === 'infra' && infraItems.map(item => (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={createColoredIcon(markerColors[item.type])}
              >
                <Popup>
                  <div className="leaflet-popup-content-inner">
                    <h4>{item.title}</h4>
                    <p className="popup-description">Status: {item.status}</p>
                    <p className="popup-date">Capacity: {item.capacity}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend overlay */}
          <div className="map-legend-overlay">
            <div className="legend-title"><Layers size={14} /> Legend</div>
            <div className="legend-items">
              {Object.entries(markerColors).slice(0, 6).map(([type, color]) => (
                <div key={type} className="legend-entry">
                  <span className="legend-dot" style={{ background: color }} />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="map-hint-overlay">
            <Info size={14} />
            <span>Click markers for details • Use scroll to zoom</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default InteractiveMapPage;
