import React from 'react';
import { 
  Layers, 
  Cpu, 
  Database, 
  Activity, 
  Server,
  Zap,
  BookOpen
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-400" />
          System Architecture & Technical Documentation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Data sources, model workflow, risk-score interpretation, and API reference
        </p>
      </div>

      {/* Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-fit">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Machine Learning Core</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Four classifiers are compared on a held-out split of generated sample data. The model with the highest weighted F1 score is saved. Feature rankings come from model coefficients or built-in tree importance; SHAP is not used.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">Geospatial Analytics</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coordinates from the generated sample records are grouped into grid-based zones for map display. These zones are exploratory demo results, not verified or current crash hotspots.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="rounded-2xl p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Outfit']">FastAPI + MongoDB</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            A FastAPI service provides prediction and analysis endpoints. Records use MongoDB when available, otherwise the app falls back to local SQLite storage.
          </p>
        </div>
      </div>

      {/* ML Pipeline Flow Diagram */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          End-to-End Machine Learning Pipeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs">
          {[
            { step: '1. Dataset Loading', desc: '6,000 generated demo records' },
            { step: '2. Feature Engineering', desc: 'Rush Hour, Night, Visibility' },
            { step: '3. Column Scaling', desc: 'StandardScaler & OneHot' },
            { step: '4. Model Training', desc: 'LR, DT, RF, XGBoost' },
            { step: '5. Model Evaluation', desc: 'F1, Accuracy, Conf Matrix' },
            { step: '6. Model Selection', desc: 'Joblib Persistence' },
            { step: '7. REST Inference', desc: 'FastAPI Prediction API' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between space-y-2">
              <span className="text-indigo-400 font-bold">{item.step}</span>
              <span className="text-[11px] text-slate-400">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk scoring methodology */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          How risk labels and scores are produced
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Training labels in this demo dataset are generated from a hand-written rules formula and then grouped into Low, Medium, and High classes. At prediction time, the saved classifier returns class probabilities; application code converts those probabilities to a 0–100 estimate and adds fixed adjustments for selected conditions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5">
            <strong className="text-indigo-300">Demo training labels</strong>
            <p className="mt-2 text-slate-400 leading-relaxed">
              A synthetic multi-factor score is thresholded into classes (&lt;38 Low, &lt;68 Medium, otherwise High). This is generated ground truth, not a record of verified crashes.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5">
            <strong className="text-indigo-300">Prediction display score</strong>
            <p className="mt-2 text-slate-400 leading-relaxed">
              Weighted class probabilities form the base estimate, followed by small rule-based adjustments. It is an application index, not a calibrated real-world crash probability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <strong className="text-emerald-400 block text-sm">Low Risk: 0 – 37.9</strong>
            <p className="text-slate-400 mt-1">Training class boundary used to generate demo labels.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <strong className="text-amber-400 block text-sm">Medium Risk: 38 – 67.9</strong>
            <p className="text-slate-400 mt-1">Training class boundary used to generate demo labels.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <strong className="text-rose-400 block text-sm">High Risk: 68 – 100</strong>
            <p className="text-slate-400 mt-1">Training class boundary used to generate demo labels.</p>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Server className="h-5 w-5 text-cyan-400" />
          REST API Specification Endpoints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {[
            { method: 'GET', path: '/api/health', desc: 'System status & database connectivity' },
            { method: 'POST', path: '/api/predict', desc: 'ML Risk Classification and Score' },
            { method: 'GET', path: '/api/predictions', desc: 'Prediction history audit log' },
            { method: 'GET', path: '/api/accidents', desc: 'Generated sample records with filters' },
            { method: 'GET', path: '/api/statistics', desc: 'Aggregations over the available sample records' },
            { method: 'GET', path: '/api/risk-zones', desc: 'Grid zones calculated from sample records' },
            { method: 'GET', path: '/api/model-performance', desc: 'Comparative metrics for 4 models' },
            { method: 'POST', path: '/api/train', desc: 'Trigger background retraining' },
          ].map((ep, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-2">
              <div>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] mr-2 ${
                  ep.method === 'POST' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {ep.method}
                </span>
                <span className="text-white font-semibold">{ep.path}</span>
              </div>
              <span className="text-[11px] font-sans text-slate-400 hidden sm:inline">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
