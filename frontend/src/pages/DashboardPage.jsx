import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Zap, 
  MapPin, 
  Cpu, 
  ArrowRight,
  RefreshCw,
  Clock,
  Car
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { getStatistics, getRiskZones, getModelPerformance } from '../services/api';

export default function DashboardPage({ setActivePage, setPrefilledLocation }) {
  const [stats, setStats] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [modelPerf, setModelPerf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [statsData, zonesData, perfData] = await Promise.all([
        getStatistics(),
        getRiskZones(),
        getModelPerformance()
      ]);
      setStats(statsData);
      setRiskZones(zonesData.zones || []);
      setModelPerf(perfData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoadError('Dashboard data could not be loaded. Check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
          <p className="font-bold text-white font-['Outfit']">{label || payload[0]?.name}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="mt-1" style={{ color: p.color || p.stroke || '#818cf8' }}>
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
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
              <Zap className="h-3.5 w-3.5" />
              Road safety analysis workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-['Outfit']">
              Analyze records. Assess scenarios.
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Review historical sample patterns, explore mapped risk zones, compare model results, or estimate risk for a set of road conditions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActivePage('predict')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300"
            >
              <Zap className="h-4 w-4" />
              Predict Accident Risk
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={loadData}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 px-4 py-3.5 text-sm font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Sample incident records"
          value={stats ? stats.total_accidents.toLocaleString() : '—'}
          subtitle="Generated dataset; not live reports"
          icon={Car}
          color="indigo"
        />
        <StatCard
          title="High-risk records"
          value={stats ? stats.high_risk_count.toLocaleString() : '—'}
          subtitle={`${stats?.high_risk_percentage ?? '—'}% of sample records`}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Sample risk zones"
          value={stats ? riskZones.length.toLocaleString() : '—'}
          subtitle="Clusters from generated records"
          icon={MapPin}
          color="amber"
        />
        <StatCard
          title="Selected model"
          value={modelPerf?.best_model_name || '—'}
          subtitle={modelPerf?.best_model_f1 != null
            ? `Weighted F1 on sample test split: ${(modelPerf.best_model_f1 * 100).toFixed(1)}%`
            : 'Evaluation results unavailable'}
          icon={Cpu}
          color="emerald"
        />
      </div>

      {/* Charts Row 1: Risk Distribution Donut & Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Risk Level Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">Risk labels across the generated sample records</p>
          </div>

          <div className="h-64 my-2">
            {stats?.risk_distribution?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.risk_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                {loading ? 'Loading sample data…' : 'No risk distribution available'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-bold block">{stats?.low_risk_count?.toLocaleString() ?? '—'}</span>
              <span className="text-slate-400 text-[10px]">Low</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 font-bold block">{stats?.medium_risk_count?.toLocaleString() ?? '—'}</span>
              <span className="text-slate-400 text-[10px]">Medium</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 font-bold block">{stats?.high_risk_count?.toLocaleString() ?? '—'}</span>
              <span className="text-slate-400 text-[10px]">High</span>
            </div>
          </div>
        </div>

        {/* Hourly Accident & Risk Score Area Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                Hourly Accident Frequency & Risk Trend
              </h3>
              <p className="text-xs text-slate-400 mt-1">24-hour diurnal risk pattern with rush-hour spikes</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.hourly_distribution || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="count" name="Accidents" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                <Area yAxisId="right" type="monotone" dataKey="avg_risk" name="Avg Risk Index (0-100)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Weather & Traffic Density Correlation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Conditions */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
            Accidents by Weather Condition
          </h3>
          <p className="text-xs text-slate-400 mb-4">Correlation of adverse weather with accident count & severity</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weather_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Accidents" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Density */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white font-['Outfit'] mb-1">
            Accidents by Traffic Density
          </h3>
          <p className="text-xs text-slate-400 mb-4">Risk correlation across Low, Medium, and High traffic flow</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.traffic_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Accidents" fill="#38bdf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Identified Risk Sectors Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
              <MapPin className="h-5 w-5 text-rose-400" />
              Identified High-Risk Geospatial Sectors
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Clustered spatial zones with highest accident risk indices</p>
          </div>
          <button
            onClick={() => setActivePage('map')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View on Interactive Map
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-3">Sector Name</th>
                <th className="pb-3 px-3">Coordinates</th>
                <th className="pb-3 px-3">Total Accidents</th>
                <th className="pb-3 px-3">Avg Risk Score</th>
                <th className="pb-3 px-3">Risk Level</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {riskZones.slice(0, 5).map((zone) => (
                <tr key={zone.zone_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{zone.zone_name}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{zone.center_lat}, {zone.center_lon}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">{zone.total_accidents}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">{zone.avg_risk_score}</span>
                    <span className="text-slate-400">/100</span>
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={zone.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        if (setPrefilledLocation) {
                          setPrefilledLocation({
                            latitude: zone.center_lat,
                            longitude: zone.center_lon
                          });
                        }
                        setActivePage('predict');
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-medium transition-colors"
                    >
                      Predict Here
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
