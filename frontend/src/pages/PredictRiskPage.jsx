import React, { useState, useEffect } from 'react';
import { 
  Target, 
  MapPin, 
  CloudRain, 
  Car, 
  Compass, 
  Clock, 
  AlertOctagon, 
  Sparkles, 
  RotateCcw,
  Sliders,
  Check,
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { predictRisk } from '../services/api';
import PredictionResultCard from '../components/PredictionResultCard';

// Fix default Leaflet icon paths
const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationPickerMap({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={customMarkerIcon} /> : null;
}

export default function PredictRiskPage({ prefilledLocation }) {
  const [formData, setFormData] = useState({
    latitude: 11.0168,
    longitude: 76.9558,
    weather_condition: 'Rainy',
    traffic_density: 'High',
    road_condition: 'Wet',
    visibility: 2.5,
    road_type: 'Highway',
    speed_limit: 80,
    vehicle_count: 120,
    accident_frequency: 8,
    day_of_week: 'Monday',
    lighting_condition: 'Night',
    urban_rural: 'Urban',
    time: '20:30',
    date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prefilledLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: prefilledLocation.latitude,
        longitude: prefilledLocation.longitude
      }));
    }
  }, [prefilledLocation]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? Number(value) : value
    }));
  };

  const handleMapCoordChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(coords[0].toFixed(5)),
      longitude: Number(coords[1].toFixed(5))
    }));
  };

  const handlePresetSelect = (preset) => {
    setFormData(prev => ({ ...prev, ...preset }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await predictRisk(formData);
      setPredictionResult(response);
      // Smooth scroll to result
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction request error:', err);
      setError(err.response?.data?.detail || 'Failed to generate prediction. Please verify backend service.');
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    {
      label: '🚨 High-Risk Storm Highway',
      data: {
        weather_condition: 'Stormy',
        traffic_density: 'High',
        road_condition: 'Wet',
        visibility: 1.0,
        road_type: 'Highway',
        speed_limit: 100,
        vehicle_count: 180,
        accident_frequency: 11,
        lighting_condition: 'Dark - No Streetlights',
        time: '22:15'
      }
    },
    {
      label: '🛡️ Safe Daylight Urban',
      data: {
        weather_condition: 'Clear',
        traffic_density: 'Low',
        road_condition: 'Dry',
        visibility: 9.0,
        road_type: 'Urban Street',
        speed_limit: 40,
        vehicle_count: 35,
        accident_frequency: 2,
        lighting_condition: 'Daylight',
        time: '11:30'
      }
    },
    {
      label: '⚠️ Foggy Morning Arterial',
      data: {
        weather_condition: 'Foggy',
        traffic_density: 'Medium',
        road_condition: 'Dry',
        visibility: 0.8,
        road_type: 'Arterial',
        speed_limit: 60,
        vehicle_count: 95,
        accident_frequency: 7,
        lighting_condition: 'Dawn',
        time: '05:45'
      }
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <Target className="h-8 w-8 text-indigo-400" />
            Predict Accident Risk
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter road, traffic, weather, and location conditions to estimate risk with the saved model. No live sensor or traffic feed is connected.
          </p>
        </div>

        {/* Presets Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetSelect(p.data)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertOctagon className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Result Display */}
      {predictionResult && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <PredictionResultCard
            result={predictionResult}
            onPredictAnother={() => {
              setPredictionResult(null);
            }}
          />
        </div>
      )}

      {/* Prediction Input Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Geospatial & Location */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2 border-b border-white/5 pb-3">
              <MapPin className="h-5 w-5 text-rose-400" />
              1. Geospatial Location
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl px-3 py-2 text-xs font-mono text-white glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl px-3 py-2 text-xs font-mono text-white glass-input"
                />
              </div>
            </div>

            {/* Click to Pick Mini Map */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>Click on map to select coordinates:</span>
                <span className="text-indigo-400">Interactive</span>
              </span>
              <div className="h-52 rounded-2xl overflow-hidden border border-white/10 relative">
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={12}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <LocationPickerMap
                    position={[formData.latitude, formData.longitude]}
                    setPosition={handleMapCoordChange}
                  />
                </MapContainer>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Area Demographics
              </label>
              <select
                name="urban_rural"
                value={formData.urban_rural}
                onChange={handleChange}
                className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
              >
                <option value="Urban">Urban (High pedestrian/commercial density)</option>
                <option value="Rural">Rural (Open terrain/low density)</option>
              </select>
            </div>
          </div>

          {/* Column 2: Environmental & Atmospheric Conditions */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2 border-b border-white/5 pb-3">
              <CloudRain className="h-5 w-5 text-cyan-400" />
              2. Atmospheric & Environmental
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Weather Condition
              </label>
              <select
                name="weather_condition"
                value={formData.weather_condition}
                onChange={handleChange}
                className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
              >
                <option value="Clear">Clear (Optimal visibility)</option>
                <option value="Cloudy">Cloudy (Overcast)</option>
                <option value="Rainy">Rainy (Reduced traction)</option>
                <option value="Foggy">Foggy (Dense haze/restricted sight)</option>
                <option value="Stormy">Stormy (Severe wind & precipitation)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Visibility Distance
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {formData.visibility} km
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10.0"
                step="0.1"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.2 km (Critical)</span>
                <span>5.0 km</span>
                <span>10.0 km (Clear)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Lighting Condition
              </label>
              <select
                name="lighting_condition"
                value={formData.lighting_condition}
                onChange={handleChange}
                className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
              >
                <option value="Daylight">Daylight (Full daylight illumination)</option>
                <option value="Dawn">Dawn (Early morning twilight)</option>
                <option value="Dusk">Dusk (Evening twilight)</option>
                <option value="Night">Night (With functional streetlights)</option>
                <option value="Dark - No Streetlights">Dark - No Streetlights (Hazardous)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Time of Day
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Day of Week
                </label>
                <select
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 3: Traffic & Road Infrastructure */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2 border-b border-white/5 pb-3">
              <Car className="h-5 w-5 text-indigo-400" />
              3. Traffic & Infrastructure
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Traffic Density
                </label>
                <select
                  name="traffic_density"
                  value={formData.traffic_density}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High (Congested)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Road Condition
                </label>
                <select
                  name="road_condition"
                  value={formData.road_condition}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                >
                  <option value="Dry">Dry (Optimal)</option>
                  <option value="Wet">Wet (Slippery)</option>
                  <option value="Damaged">Damaged (Potholes/Rough)</option>
                  <option value="Icy">Icy (Zero friction)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Road Type & Class
              </label>
              <select
                name="road_type"
                value={formData.road_type}
                onChange={handleChange}
                className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
              >
                <option value="Highway">National / State Highway</option>
                <option value="Expressway">Access-Controlled Expressway</option>
                <option value="Arterial">Major Arterial City Corridor</option>
                <option value="Urban Street">Urban Collector / Residential</option>
                <option value="Rural Road">Rural Single-Lane Link</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Speed Limit
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {formData.speed_limit} km/h
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="10"
                name="speed_limit"
                value={formData.speed_limit}
                onChange={handleChange}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>30 km/h</span>
                <span>60 km/h</span>
                <span>120 km/h</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Est. Vehicle Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="400"
                  name="vehicle_count"
                  value={formData.vehicle_count}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Historical Incidents
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  name="accident_frequency"
                  value={formData.accident_frequency}
                  onChange={handleChange}
                  className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Prediction Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 px-10 py-4 text-base font-extrabold text-white shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all duration-300 disabled:opacity-50"
          >
            <Zap className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
            {loading ? 'Evaluating ML Pipeline...' : 'Run Accident Risk Prediction'}
          </button>
        </div>
      </form>
    </div>
  );
}
