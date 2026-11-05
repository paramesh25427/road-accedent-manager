import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Filter, 
  Download, 
  Calendar, 
  Sun, 
  Car, 
  ShieldAlert, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { getAccidents, getStatistics } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Filter criteria
  const [filterWeather, setFilterWeather] = useState('All');
  const [filterTraffic, setFilterTraffic] = useState('All');
  const [filterRoad, setFilterRoad] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterRoadType, setFilterRoadType] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const filters = {};
      if (filterWeather !== 'All') filters.weather = filterWeather;
      if (filterTraffic !== 'All') filters.traffic = filterTraffic;
      if (filterRoad !== 'All') filters.road_condition = filterRoad;
      if (filterRisk !== 'All') filters.risk_level = filterRisk;
      if (filterRoadType !== 'All') filters.road_type = filterRoadType;
      filters.limit = 1000;

      const [statsData, accidentsData] = await Promise.all([
        getStatistics(),
        getAccidents(filters)
      ]);
      setStats(statsData);
      setAccidents(accidentsData.accidents || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setLoadError('Analytics data could not be loaded. Check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterWeather, filterTraffic, filterRoad, filterRisk, filterRoadType]);

  const exportCSV = () => {
    if (!accidents.length) return;
    const headers = Object.keys(accidents[0]).join(',');
    const rows = accidents.map(acc => Object.values(acc).map(val => `"${val}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accident_analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SEVERITY_COLORS = ['#38bdf8', '#fbbf24', '#f97316', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
          <p className="font-bold text-white font-['Outfit']">{label || payload[0]?.name}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="mt-1 text-slate-200" style={{ color: p.color || '#818cf8' }}>
              {p.name}: <span className="font-semibold text-white">{p.value?.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
            Accident Analytics & Risk Breakdown
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Summary charts use the full generated sample dataset. Filters apply to the records table and CSV export only.
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Multi-dimensional analytical slicing across weather, road infrastructure, speed limits, and diurnal cycles
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={loading || accidents.length === 0}
          className="flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 px-4 py-2.5 text-xs font-semibold text-indigo-300 transition-colors w-fit disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export displayed records ({accidents.length}, max 1,000)
        </button>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {/* Filter Control Drawer */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Filter className="h-4 w-4 text-indigo-400" />
          <span>Interactive Analytical Filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Weather</label>
            <select
              value={filterWeather}
              onChange={(e) => setFilterWeather(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
            >
              <option value="All">All Weather Types</option>
              <option value="Clear">Clear</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Rainy">Rainy</option>
              <option value="Foggy">Foggy</option>
              <option value="Stormy">Stormy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Traffic Density</label>
            <select
              value={filterTraffic}
              onChange={(e) => setFilterTraffic(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
            >
              <option value="All">All Densities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Road Condition</label>
            <select
              value={filterRoad}
              onChange={(e) => setFilterRoad(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
            >
              <option value="All">All Road Surfaces</option>
              <option value="Dry">Dry</option>
              <option value="Wet">Wet</option>
              <option value="Damaged">Damaged</option>
              <option value="Icy">Icy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Risk Level</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
            >
              <option value="All">All Risk Classes</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Road Type</label>
            <select
              value={filterRoadType}
              onChange={(e) => setFilterRoadType(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs text-white glass-input"
            >
              <option value="All">All Road Classes</option>
              <option value="Highway">Highway</option>
              <option value="Expressway">Expressway</option>
              <option value="Arterial">Arterial</option>
              <option value="Urban Street">Urban Street</option>
              <option value="Rural Road">Rural Road</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Road Type vs Avg Risk */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
            Accident Volume by Road Classification
          </h3>
          <p className="text-xs text-slate-400 mb-4">Expressway, Highway, and Urban arterial distributions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.road_type_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Accidents" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
            Accident Severity Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Minor, Moderate, Severe, and Fatal incident breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(stats?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`sev-cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lighting Condition vs Accidents */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl md:col-span-2">
          <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
            Lighting Conditions & Ambient Hazard Correlation
          </h3>
          <p className="text-xs text-slate-400 mb-4">Impact of Daylight, Dusk, Night, and Dark Unlit Corridors</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.lighting_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Accidents" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg_risk" name="Avg Risk Index" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
