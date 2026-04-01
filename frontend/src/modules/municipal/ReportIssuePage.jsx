import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { Building2, ArrowLeft, MapPin, AlertTriangle, Clock, Camera, Send, FileText, Satellite, Map as MapIcon, Loader2, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../DomainDashboard.css';
import './Municipal.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom pin icon for picked location
const pickedIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="
    background: #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 3px 12px rgba(239,68,68,0.5);
    position: relative;
    animation: markerBounce 0.5s ease-out;
  "><div style="
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  "></div></div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

// Click handler component for the map
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

// Fly to a location when it changes
function FlyToLocation({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom || 15, { duration: 1 });
    }
  }, [position, zoom, map]);
  return null;
}

// Reverse geocode using Nominatim (free OSM API)
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

// Forward geocode / search locations globally using Nominatim
async function searchLocation(query) {
  if (!query || query.length < 3) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    return data;
  } catch {
    return [];
  }
}

export function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [satelliteView, setSatelliteView] = useState(true);
  const [flyToPos, setFlyToPos] = useState(null);
  const [geocodedAddress, setGeocodedAddress] = useState(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // Generate ticket number once when component mounts using state initializer
  const [ticketNumber] = useState(() => Math.floor(Math.random() * 9000) + 1000);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    locality: '',
    address: '',
    urgency: 'medium',
    startDate: '',
    expectedDuration: '',
    affectedPeople: '',
    photos: [],
    contactPreference: 'email',
    additionalContact: ''
  });

  const [errors, setErrors] = useState({});
  const [pickedLocation, setPickedLocation] = useState(null);

  // When map is clicked, reverse geocode and auto-fill address
  const handleLocationSelect = useCallback(async (latlng) => {
    setPickedLocation([latlng.lat, latlng.lng]);
    setIsGeocodingLoading(true);
    setGeocodedAddress(null);

    const result = await reverseGeocode(latlng.lat, latlng.lng);
    setIsGeocodingLoading(false);

    if (result && result.address) {
      const addr = result.address;
      const parts = [
        addr.road || addr.pedestrian || addr.footway,
        addr.neighbourhood || addr.suburb,
        addr.city_district || addr.county,
        addr.city || addr.town || addr.village,
      ].filter(Boolean);

      const fullAddress = parts.join(', ');
      const localityName = addr.suburb || addr.neighbourhood || addr.city_district || '';

      setGeocodedAddress({
        display: result.display_name,
        short: fullAddress,
        suburb: localityName,
        raw: addr,
      });

      // Auto-fill address field
      setFormData(prev => ({
        ...prev,
        address: fullAddress,
      }));

      // Auto-fill locality from reverse geocoded data
      setFormData(prev => ({ ...prev, locality: localityName || (addr.city || addr.town || addr.village || '') }));
      setLocationSearch(localityName || (addr.city || addr.town || addr.village || ''));
    }
  }, []);

  // Debounced location search
  const handleLocationSearchChange = useCallback((e) => {
    const query = e.target.value;
    setLocationSearch(query);
    setFormData(prev => ({ ...prev, locality: query }));
    
    if (errors.locality) {
      setErrors(prev => ({ ...prev, locality: '' }));
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce the search by 400ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(query);
      setLocationSuggestions(results);
      setShowSuggestions(results.length > 0);
      setIsSearching(false);

      // Auto-fly to the first result so map stays in sync
      if (results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        setFlyToPos([lat, lng]);
        setPickedLocation([lat, lng]);

        // Auto-fill address from the first result
        const addr = first.address || {};
        const parts = [
          addr.road,
          addr.suburb || addr.neighbourhood,
          addr.city || addr.town || addr.village,
          addr.state,
          addr.country,
        ].filter(Boolean);
        setFormData(prev => ({ ...prev, address: parts.join(', ') }));
        setGeocodedAddress({ short: parts.join(', '), display: first.display_name });
      }
    }, 400);
  }, [errors]);

  // When a suggestion is selected, fly to it and fill the form
  const handleSuggestionSelect = useCallback((suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const name = suggestion.address?.suburb || suggestion.address?.city || suggestion.address?.town || suggestion.display_name.split(',')[0];
    
    setLocationSearch(name);
    setFormData(prev => ({ ...prev, locality: name }));
    setFlyToPos([lat, lng]);
    setPickedLocation([lat, lng]);
    setShowSuggestions(false);

    // Also fill address
    const parts = [
      suggestion.address?.road,
      suggestion.address?.suburb || suggestion.address?.neighbourhood,
      suggestion.address?.city || suggestion.address?.town,
      suggestion.address?.state,
      suggestion.address?.country,
    ].filter(Boolean);
    setFormData(prev => ({ ...prev, address: parts.join(', ') }));
    setGeocodedAddress({ short: parts.join(', '), display: suggestion.display_name });
  }, []);

  const categories = [
    { value: 'roads', label: 'Roads & Potholes', icon: '🛣️' },
    { value: 'street_lights', label: 'Street Lights', icon: '💡' },
    { value: 'water_supply', label: 'Water Supply', icon: '💧' },
    { value: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
    { value: 'sewage', label: 'Sewage & Drainage', icon: '🚰' },
    { value: 'parks', label: 'Parks & Public Spaces', icon: '🌳' },
    { value: 'noise', label: 'Noise Pollution', icon: '🔊' },
    { value: 'encroachment', label: 'Encroachment', icon: '🚧' },
    { value: 'stray_animals', label: 'Stray Animals', icon: '🐕' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', description: 'Can wait a few weeks', color: 'var(--gray-500)' },
    { value: 'medium', label: 'Medium', description: 'Should be addressed within a week', color: 'var(--info-color)' },
    { value: 'high', label: 'High', description: 'Needs attention within 2-3 days', color: 'var(--warning-color)' },
    { value: 'critical', label: 'Critical', description: 'Emergency - immediate action needed', color: 'var(--error-color)' }
  ];


  const durationOptions = [
    { value: 'hours', label: 'A few hours' },
    { value: 'day', label: 'About a day' },
    { value: 'few_days', label: '2-3 days' },
    { value: 'week', label: 'About a week' },
    { value: 'more_than_week', label: 'More than a week' },
    { value: 'ongoing', label: 'Ongoing / Persistent' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.photos.length > 5) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 5 photos allowed' }));
      return;
    }
    
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Issue title is required';
    if (!formData.description.trim()) newErrors.description = 'Please describe the issue';
    else if (formData.description.length < 20) newErrors.description = 'Description should be at least 20 characters';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.locality) newErrors.locality = 'Please select your locality';
    if (!formData.urgency) newErrors.urgency = 'Please select urgency level';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // 1. Save to Local Storage (Instant and Local-Only as requested)
      const localIssues = JSON.parse(localStorage.getItem('local_municipal_issues') || '[]');
      const newIssue = {
        id: 'local-' + Date.now(),
        citizen_id: user?.id,
        citizen_name: user?.full_name || 'Anonymous User',
        citizen_phone: user?.phone || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_name: formData.locality || 'Generated Location',
        locality: formData.locality,
        address: formData.address || formData.locality,
        urgency: formData.urgency,
        status: 'submitted',
        priority: formData.urgency === 'critical' ? 'critical' : (formData.urgency === 'high' ? 'high' : (formData.urgency === 'medium' ? 'medium' : 'low')),
        createdAt: new Date().toISOString(),
        isLocal: true
      };
      
      localStorage.setItem('local_municipal_issues', JSON.stringify([newIssue, ...localIssues]));
      
      // Success Notification (Instant)
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      // Even on local error, try to show success for better UX as requested
      setSubmitted(true);
    }
    
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="domain-dashboard">
        <div className="success-container">
          <div className="success-icon municipal">
            <Building2 size={48} />
          </div>
          <h2>Issue Reported Successfully!</h2>
          <p>Your issue has been submitted and assigned ticket number <strong>#MUN-2026-{ticketNumber}</strong>. You will receive updates via your preferred contact method.</p>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/municipal')}>
              Back to Municipal Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setFormData({
              title: '', description: '', category: '', locality: '', address: '',
              urgency: 'medium', startDate: '', expectedDuration: '', affectedPeople: '',
              photos: [], contactPreference: 'email', additionalContact: ''
            }); }}>
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="domain-dashboard">
      <div className="page-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/municipal')}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="page-title">Report an Issue</h1>
          <p className="page-description">Help us keep our city clean and safe by reporting civic issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {Object.keys(errors).length > 0 && (
          <div className="form-error-alert" style={{ background: 'var(--error-light)', color: 'var(--error-color)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--error-color)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} /> Please fix the following errors:
            </h4>
            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
              {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}
        <div className="form-section">
          <h3 className="form-section-title">
            <FileText size={18} /> Issue Details
          </h3>
          
          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title describing the issue"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.value}
                  className={`category-card ${formData.category === cat.value ? 'selected' : ''}`}
                  onClick={() => { handleInputChange({ target: { name: 'category', value: cat.value } }); }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed description of the issue. Include any relevant information that might help resolve it faster."
              rows={5}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <MapPin size={18} /> Location
          </h3>
          
          <div className="location-picker">
            <div className="location-map-container">
              <div className="map-toolbar">
                <button
                  type="button"
                  className={`map-view-toggle ${!satelliteView ? 'active' : ''}`}
                  onClick={() => setSatelliteView(false)}
                >
                  <MapIcon size={14} /> Street
                </button>
                <button
                  type="button"
                  className={`map-view-toggle ${satelliteView ? 'active' : ''}`}
                  onClick={() => setSatelliteView(true)}
                >
                  <Satellite size={14} /> Satellite
                </button>
              </div>
              <MapContainer
                center={[17.3850, 78.4867]}
                zoom={12}
                style={{ width: '100%', height: '350px' }}
                scrollWheelZoom={true}
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
                <LocationPicker onLocationSelect={handleLocationSelect} />
                {flyToPos && <FlyToLocation position={flyToPos} zoom={15} />}
                {pickedLocation && (
                  <Marker position={pickedLocation} icon={pickedIcon} />
                )}
              </MapContainer>

              {/* Location readout */}
              {isGeocodingLoading ? (
                <div className="location-readout loading">
                  <Loader2 size={14} className="spin" /> Fetching location details...
                </div>
              ) : geocodedAddress ? (
                <div className="location-readout success">
                  <div className="readout-main">
                    <Navigation size={14} />
                    <span>{geocodedAddress.short}</span>
                  </div>
                  <div className="readout-coords">
                    {pickedLocation[0].toFixed(5)}, {pickedLocation[1].toFixed(5)}
                  </div>
                </div>
              ) : pickedLocation ? (
                <p className="location-readout">
                  <MapPin size={14} /> Location pinned: {pickedLocation[0].toFixed(4)}, {pickedLocation[1].toFixed(4)}
                </p>
              ) : (
                <p className="location-readout hint">
                  <MapPin size={14} /> Click on the map to pin the issue location
                </p>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group location-search-group">
                <label htmlFor="locality">Location * {formData.locality && <span className="auto-tag">📍 Linked to map</span>}</label>
                <div className="location-search-wrapper">
                  <input
                    type="text"
                    id="locality"
                    value={locationSearch}
                    onChange={handleLocationSearchChange}
                    onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search any place worldwide..."
                    className={errors.locality ? 'error' : ''}
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="search-indicator">
                      <Loader2 size={14} className="spin" />
                    </div>
                  )}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="location-suggestions">
                      {locationSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="suggestion-item"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <MapPin size={14} />
                          <div className="suggestion-text">
                            <span className="suggestion-name">{suggestion.display_name.split(',')[0]}</span>
                            <span className="suggestion-detail">{suggestion.display_name.split(',').slice(1, 4).join(',')}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.locality && <span className="error-text">{errors.locality}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Specific Address / Landmark {geocodedAddress && <span className="auto-tag">✨ Auto-filled</span>}</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={geocodedAddress ? '' : 'Click the map or type manually...'}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <AlertTriangle size={18} /> Urgency Level *
          </h3>
          
          <div className="urgency-grid">
            {urgencyLevels.map(level => (
              <label
                key={level.value}
                className={`urgency-card ${formData.urgency === level.value ? 'selected' : ''}`}
                style={{ '--urgency-color': level.color }}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={level.value}
                  checked={formData.urgency === level.value}
                  onChange={handleInputChange}
                />
                <div className="urgency-content">
                  <span className="urgency-label">{level.label}</span>
                  <span className="urgency-desc">{level.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <Clock size={18} /> Time Period
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="startDate">When did this issue start?</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expectedDuration">How long has it been?</label>
              <select
                id="expectedDuration"
                name="expectedDuration"
                value={formData.expectedDuration}
                onChange={handleInputChange}
              >
                <option value="">Select duration</option>
                {durationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="affectedPeople">Approximate number of people affected</label>
              <input
                type="number"
                id="affectedPeople"
                name="affectedPeople"
                value={formData.affectedPeople}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">
            <Camera size={18} /> Photos (Optional)
          </h3>
          
          <div className="form-group">
            <p className="form-help">Upload up to 5 photos to help us understand the issue better</p>
            
            <div className="photo-upload-area">
              <label className="photo-upload-btn">
                <Camera size={24} />
                <span>Add Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>
              
              {formData.photos.length > 0 && (
                <div className="photo-previews">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-preview">
                      <img src={photo.preview} alt={`Preview ${index + 1}`} />
                      <button type="button" onClick={() => removePhoto(index)} className="remove-photo">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.photos && <span className="error-text">{errors.photos}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Contact Preferences</h3>
          
          <div className="form-group">
            <label>How would you like to receive updates?</label>
            <div className="radio-group horizontal">
              <label className="radio-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="email"
                  checked={formData.contactPreference === 'email'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">Email</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="sms"
                  checked={formData.contactPreference === 'sms'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">SMS</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="contactPreference"
                  value="both"
                  checked={formData.contactPreference === 'both'}
                  onChange={handleInputChange}
                />
                <span className="radio-label">Both</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/municipal')}>
            Cancel
          </button>
          {errors.submit && <p className="error-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>{errors.submit}</p>}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Submitting...</>
            ) : (
              <><Send size={18} /> Submit Report</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReportIssuePage;
