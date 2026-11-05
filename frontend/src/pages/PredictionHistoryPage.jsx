import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Search, 
  MapPin, 
  Clock, 
  Eye, 
  AlertOctagon, 
  CheckCircle2, 
  Percent,
  X
} from 'lucide-react';
import { getPredictions, clearPredictions } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function PredictionHistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPred, setSelectedPred] = useState(null);
  const [loadError, setLoadError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await getPredictions(100);
      setPredictions(res.predictions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setLoadError('Prediction history could not be loaded. Check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all prediction audit records?')) {
      await clearPredictions();
      setPredictions([]);
    }
  };

  const filteredPredictions = predictions.filter(p => {
    const term = searchTerm.toLowerCase();
    const risk = (p.risk_level || '').toLowerCase();
    const model = (p.model_used || '').toLowerCase();
    const weather = (p.input_features?.weather_condition || '').toLowerCase();
    return risk.includes(term) || model.includes(term) || weather.includes(term);
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <History className="h-8 w-8 text-indigo-400" />
            Prediction Audit & Inference History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Saved log of scenario estimates, input conditions, and model classifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
          >
            {loading ? 'Loading…' : 'Refresh log'}
          </button>
          {predictions.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Log
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {/* Search and Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by risk level, model, or weather..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs text-white glass-input"
          />
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="text-white">{filteredPredictions.length}</span> of <span className="text-white">{predictions.length}</span> latest stored records (max 100)
        </div>
      </div>

      {/* Predictions Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        {filteredPredictions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <AlertOctagon className="h-10 w-10 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              {loading ? 'Loading prediction history…' : loadError ? 'Prediction history is unavailable.' : searchTerm ? 'No records match this search.' : 'No prediction entries yet.'}
            </p>
            {!loading && !loadError && !searchTerm && (
              <p className="text-xs">Run a scenario assessment to add an entry to this log.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Conditions</th>
                  <th className="py-3.5 px-4">Risk Score</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Model</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPredictions.map((pred) => {
                  const feats = pred.input_features || {};
                  return (
                    <tr key={pred.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {pred.timestamp ? new Date(pred.timestamp).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {pred.location?.latitude?.toFixed(4)}, {pred.location?.longitude?.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="font-semibold">{feats.weather_condition || 'Clear'}</span>, {feats.road_condition || 'Dry'} ({feats.traffic_density || 'Med'} Traffic)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-white text-sm">{pred.risk_score}</span>
                        <span className="text-slate-400 text-[10px]">/100</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={pred.risk_level} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {Math.round(pred.confidence * 100)}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 truncate max-w-[130px]">
                        {pred.model_used}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedPred(pred)}
                          className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <RiskBadge level={selectedPred.risk_level} size="md" />
                  Prediction Audit #{selectedPred.id}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Timestamp: {selectedPred.timestamp}
                </p>
              </div>
              <button
                onClick={() => setSelectedPred(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Risk Score</span>
                <span className="text-lg font-black text-white">{selectedPred.risk_score}/100</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase">Confidence</span>
                <span className="text-lg font-black text-indigo-400">{Math.round(selectedPred.confidence * 100)}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 sm:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase">Model Used</span>
                <span className="text-sm font-bold text-white truncate block">{selectedPred.model_used}</span>
              </div>
            </div>

            {selectedPred.explanation && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                <strong className="text-indigo-300 block mb-1">Generated Assessment:</strong>
                {selectedPred.explanation}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Input Feature Snapshot:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(selectedPred.input_features || {}).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-xl bg-slate-950/50 border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase block">{k.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-white">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
