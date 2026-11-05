import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Popup, 
  Circle,
  useMap
} from 'react-leaflet';
import { 
  Layers, 
  Filter, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  RefreshCw,
  Info,
  Car
} from 'lucide-react';
import { getAccidents, getRiskZones } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function AccidentMapPage({ onSelectLocationForPredict }) {
  const [accidents, setAccidents] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Layers & Filter State
  const [viewMode, setViewMode] = useState('both'); // 'markers', 'zones', 'both'
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedWeather, setSelectedWeather] = useState('All');
  const [selectedRoad, setSelectedRoad] = useState('All');

  const defaultCenter = [11.0168, 76.9558]; // Coimbatore / Tamil Nadu Corridor

  const loadMapData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const filters = {};
      if (selectedRisk !== 'All') filters.risk_level = selectedRisk;
      if (selectedWeather !== 'All') filters.weather = selectedWeather;
      if (selectedRoad !== 'All') filters.road_condition = selectedRoad;
      filters.limit = 400; // Optimal performance for SVG circle markers

      const [accidentsRes, zonesRes] = await Promise.all([
        getAccidents(filters),
        getRiskZones()
      ]);

      setAccidents(accidentsRes.accidents || []);
      setRiskZones(zonesRes.zones || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
      setLoadError('Map data could not be loaded. Check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, [selectedRisk, selectedWeather, selectedRoad]);

  const getMarkerColor = (level) => {
    if (level === 'High') return '#EF4444';
    if (level === 'Medium') return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Map Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <Layers className="h-7 w-7 text-indigo-400" />
            Accident Geospatial Heatmap & Risk Zones
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Filters apply to incident points; risk-zone overlays show all generated sample records
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              viewMode === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setViewMode('zones')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              viewMode === 'zones' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Risk Sectors
          </button>
          <button
            onClick={() => setViewMode('markers')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              viewMode === 'markers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Accident Points
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Risk Classification
          </label>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full rounded-xl px-2.5 py-1.5 text-xs text-white glass-input"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Weather Filter
          </label>
          <select
            value={selectedWeather}
            onChange={(e) => setSelectedWeather(e.target.value)}
            className="w-full rounded-xl px-2.5 py-1.5 text-xs text-white glass-input"
          >
            <option value="All">All Weather Types</option>
            <option value="Clear">Clear</option>
            <option value="Rainy">Rainy</option>
            <option value="Foggy">Foggy</option>
            <option value="Stormy">Stormy</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Road Surface
          </label>
          <select
            value={selectedRoad}
            onChange={(e) => setSelectedRoad(e.target.value)}
            className="w-full rounded-xl px-2.5 py-1.5 text-xs text-white glass-input"
          >
            <option value="All">All Road Conditions</option>
            <option value="Dry">Dry</option>
            <option value="Wet">Wet</option>
            <option value="Damaged">Damaged</option>
            <option value="Icy">Icy</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={loadMapData}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 font-semibold transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Filter ({accidents.length} pts)
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[450px]">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Clustered Risk Zones (Circles) */}
          {(viewMode === 'zones' || viewMode === 'both') &&
            riskZones.map((zone) => {
              const isHigh = zone.risk_level === 'High';
              const isMed = zone.risk_level === 'Medium';
              const color = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';

              return (
                <Circle
                  key={zone.zone_id}
                  center={[zone.center_lat, zone.center_lon]}
                  radius={zone.radius_meters || 1200}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.18,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-2 text-xs font-sans min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                        <span className="font-bold text-white font-['Outfit']">{zone.zone_name}</span>
                        <RiskBadge level={zone.risk_level} size="sm" showDot={false} />
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <p>Total Incidents: <span className="font-semibold text-white">{zone.total_accidents}</span></p>
                        <p>Avg Risk Index: <span className="font-bold text-amber-400">{zone.avg_risk_score}/100</span></p>
                        <p>High-Risk Incidents: <span className="text-rose-400 font-semibold">{zone.high_risk_count}</span></p>
                        <p>Predominant Weather: <span className="text-slate-200">{zone.predominant_weather}</span></p>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}

          {/* Render Individual Accident Points */}
          {(viewMode === 'markers' || viewMode === 'both') &&
            accidents.map((acc) => (
              <CircleMarker
                key={acc.accident_id}
                center={[acc.latitude, acc.longitude]}
                radius={acc.risk_level === 'High' ? 6 : acc.risk_level === 'Medium' ? 5 : 4}
                pathOptions={{
                  color: '#ffffff',
                  weight: 1,
                  fillColor: getMarkerColor(acc.risk_level),
                  fillOpacity: 0.85
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-xs font-sans min-w-[210px]">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{acc.accident_id}</span>
                      <RiskBadge level={acc.risk_level} size="sm" showDot={false} />
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <p>Risk Score: <span className="font-bold text-white">{acc.risk_score}/100</span></p>
                      <p>Weather: <span className="text-slate-200">{acc.weather_condition}</span></p>
                      <p>Traffic Density: <span className="text-slate-200">{acc.traffic_density}</span></p>
                      <p>Road Condition: <span className="text-slate-200">{acc.road_condition}</span></p>
                      <p>Speed Limit: <span className="text-slate-200">{acc.speed_limit} km/h</span></p>
                      <p>Severity: <span className="text-amber-400 font-semibold">{acc.accident_severity}</span></p>
                      <p>Time & Date: <span className="text-slate-400 font-mono text-[10px]">{acc.date} {acc.time}</span></p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>

        {/* Floating Map Legend HUD */}
        <div className="absolute bottom-5 right-5 z-[1000] p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-xl shadow-2xl text-xs space-y-2 pointer-events-auto">
          <p className="font-bold text-white font-['Outfit'] text-[11px] uppercase tracking-wider">
            Risk Map Legend
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="text-slate-300">High Risk Zone / Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-slate-300">Medium Risk Zone / Incident</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-slate-300">Low Risk Incident</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
