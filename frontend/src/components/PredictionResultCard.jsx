import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Percent, 
  Activity, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import RiskScoreGauge from './RiskScoreGauge';

export default function PredictionResultCard({ result, onPredictAnother }) {
  if (!result) return null;

  const {
    risk_level,
    risk_score,
    confidence_percentage,
    model_used,
    probabilities = {},
    location,
    explanation = '',
    contributing_factors = [],
    safety_recommendations = []
  } = result;

  const isHigh = risk_level.toUpperCase() === 'HIGH';
  const isMed = risk_level.toUpperCase() === 'MEDIUM';

  const glowClass = isHigh ? 'glow-red border-rose-500/40' : isMed ? 'glow-amber border-amber-500/40' : 'glow-emerald border-emerald-500/40';

  return (
    <div className={`overflow-hidden rounded-3xl border bg-slate-900/90 backdrop-blur-2xl transition-all duration-500 ${glowClass}`}>
      {/* Header Banner */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 bg-gradient-to-r ${
        isHigh ? 'from-rose-950/60 to-slate-900' : isMed ? 'from-amber-950/60 to-slate-900' : 'from-emerald-950/60 to-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-2.5 border ${
            isHigh ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : isMed ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}>
            {isHigh ? <AlertTriangle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">
              Accident Risk Assessment
            </h3>
            <p className="text-xs text-slate-400">
              Scenario estimate from the saved classifier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RiskBadge level={risk_level} size="lg" />
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/50 border border-white/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Application risk score (0–100)
            </p>
            <RiskScoreGauge score={risk_score} level={risk_level} size={170} />
            <p className="mt-1 text-center text-[10px] text-slate-500">
              Not a calibrated real-world crash probability
            </p>
            <div className="mt-3 flex items-center justify-between w-full text-xs text-slate-400 px-4">
              <span>0 (Safe)</span>
              <span>100 (Critical)</span>
            </div>
          </div>

          {/* Model & Confidence breakdown */}
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-indigo-400" />
                  Top-class probability
                </span>
                <p className="mt-1.5 text-2xl font-black text-white font-['Outfit']">
                  {confidence_percentage}%
                </p>
                <p className="mt-1 text-[10px] text-slate-500">Not calibrated against real-world outcomes</p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${confidence_percentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  Active Model
                </span>
                <p className="mt-1.5 text-lg font-bold text-white font-['Outfit'] truncate">
                  {model_used}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active saved model
                </p>
              </div>
            </div>

            {/* Probability Distribution bars */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-purple-400" />
                Class Probability Distribution
              </span>
              <div className="space-y-1.5 pt-1">
                {Object.entries(probabilities).map(([lvl, prob]) => {
                  const pct = Math.round(prob * 100);
                  const color = lvl === 'High' ? 'bg-rose-500' : lvl === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
                  return (
                    <div key={lvl} className="flex items-center gap-3 text-xs">
                      <span className="w-16 font-medium text-slate-300">{lvl}:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right font-semibold text-slate-200">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Explanation */}
        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-indigo-200">
                Predictive Analysis Summary
              </h4>
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Contributing Factors & Safety Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Contributing Factors */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Rule-based factors (not model attribution)
            </h4>
            <ul className="space-y-2">
              {contributing_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Safety Recommendations
            </h4>
            <ul className="space-y-2">
              {safety_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Location & Context Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-400" />
            <span>Scenario location: {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}</span>
          </div>
          {onPredictAnother && (
            <button
              onClick={onPredictAnother}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Predict Another Scenario
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
