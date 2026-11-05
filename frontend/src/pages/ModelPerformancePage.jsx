import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  RefreshCw, 
  Award, 
  Zap, 
  Check, 
  Table
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';
import { getModelPerformance, triggerTraining } from '../services/api';

export default function ModelPerformancePage() {
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('');
  const [trainStatus, setTrainStatus] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadMetrics = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getModelPerformance();
      setPerfData(data);
      const initialModel = data.best_model_name || Object.keys(data.models || {})[0];
      if (initialModel) {
        setSelectedModel(initialModel);
      }
    } catch (err) {
      console.error('Failed to load model performance:', err);
      setLoadError('Model evaluation results could not be loaded. Check the backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setTrainStatus(null);
    try {
      const result = await triggerTraining();
      setTrainStatus(`${result.message || 'Training request accepted.'} Refresh results after the background job completes.`);
    } catch {
      setTrainStatus('Training request failed. Check the backend logs and try again.');
    } finally {
      setIsRetraining(false);
    }
  };

  const modelsList = [
    'Logistic Regression',
    'Decision Tree',
    'Random Forest',
    'XGBoost'
  ];

  const currentModelMetrics = perfData?.models?.[selectedModel];
  const featureImportance = perfData?.feature_importance?.[selectedModel] || [];

  const classLabels = ['Low', 'Medium', 'High'];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <Cpu className="h-8 w-8 text-indigo-400" />
            Machine Learning Model Evaluation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare classifier results on the generated dataset’s held-out test split. These metrics are not real-world validation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh results
          </button>
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
            {isRetraining ? 'Starting…' : 'Retrain models'}
          </button>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {trainStatus && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{trainStatus}</span>
        </div>
      )}

      {/* Best Model Callout Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 p-3.5 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Best model in saved evaluation
            </span>
            <h2 className="text-2xl font-black text-white font-['Outfit']">
              {perfData?.best_model_name || (loading ? 'Loading…' : 'Not available')}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Chosen by weighted F1 score among the four models. The deployed predictor loads the saved best model.
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              {perfData?.total_training_samples != null && perfData?.total_test_samples != null
                ? `${perfData.total_training_samples.toLocaleString()} training / ${perfData.total_test_samples.toLocaleString()} test records`
                : 'Training and test record counts unavailable'}
              {perfData?.trained_at ? ` · Trained ${new Date(perfData.trained_at).toLocaleString()}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
            <p className="text-xl font-extrabold text-white font-['Outfit']">
              {perfData?.best_model_accuracy != null ? `${(perfData.best_model_accuracy * 100).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400">F1 Score</span>
            <p className="text-xl font-extrabold text-emerald-400 font-['Outfit']">
              {perfData?.best_model_f1 != null ? `${(perfData.best_model_f1 * 100).toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Table className="h-5 w-5 text-indigo-400" />
          Comparative Model Performance Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-4">Classification Architecture</th>
                <th className="pb-3 px-4">Accuracy</th>
                <th className="pb-3 px-4">Precision (Weighted)</th>
                <th className="pb-3 px-4">Recall (Weighted)</th>
                <th className="pb-3 px-4">F1 Score (Weighted)</th>
                <th className="pb-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {modelsList.map((name) => {
                const m = perfData?.models?.[name];
                const isBest = name === perfData?.best_model_name;
                const isSelected = name === selectedModel;

                return (
                  <tr
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-600/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isBest ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                      {name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{m ? `${(m.accuracy * 100).toFixed(2)}%` : '—'}</td>
                    <td className="py-3.5 px-4 text-slate-200">{m ? `${(m.precision * 100).toFixed(2)}%` : '—'}</td>
                    <td className="py-3.5 px-4 text-slate-200">{m ? `${(m.recall * 100).toFixed(2)}%` : '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{m ? `${(m.f1_score * 100).toFixed(2)}%` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {m && isBest ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-sans font-semibold text-emerald-400">
                          <Check className="h-3 w-3" /> Champion
                        </span>
                      ) : m ? (
                        <span className="text-slate-500 text-[10px] font-sans">Evaluated</span>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-sans">Not available</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Deep-Dive: Confusion Matrix & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Visualizer */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">
                Confusion Matrix: {selectedModel}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Actual vs Predicted Class Frequencies</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
              Held-out sample split: 20%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {/* Header row */}
              <div className="text-[10px] font-sans font-semibold text-slate-400 flex items-center justify-center">
                Actual \ Pred
              </div>
              {classLabels.map(l => (
                <div key={l} className="font-bold text-indigo-300 py-1">{l}</div>
              ))}

              {/* Rows */}
              {classLabels.map((actualLabel, rowIdx) => {
                const row = currentModelMetrics?.confusion_matrix?.[rowIdx] || [];
                return (
                  <React.Fragment key={actualLabel}>
                    <div className="font-bold text-slate-300 flex items-center justify-center font-sans">
                      {actualLabel}
                    </div>
                    {classLabels.map((_, colIdx) => {
                      const val = row[colIdx];
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <div
                          key={colIdx}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-105 ${
                            isDiagonal
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                              : 'bg-slate-900/80 border-white/5 text-slate-400'
                          }`}
                        >
                          <span className="text-sm font-black text-white">{val ?? '—'}</span>
                          <span className="text-[9px] opacity-75">{val == null ? 'No data' : isDiagonal ? 'Match' : 'Error'}</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Diagonal cells indicate accurate class classifications.</span>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Feature Importance ({selectedModel})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Ranked predictive weight of engineered input variables</p>
          </div>

          <div className="h-64">
            {featureImportance.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureImportance.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                  <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Importance Weight']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="percentage" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                {loading ? 'Loading evaluation results…' : 'Feature importance is unavailable for this model.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
