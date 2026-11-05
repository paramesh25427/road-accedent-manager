import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import PredictRiskPage from './pages/PredictRiskPage';
import AccidentMapPage from './pages/AccidentMapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import AboutPage from './pages/AboutPage';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [prefilledLocation, setPrefilledLocation] = useState(null);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            setActivePage={setActivePage}
            setPrefilledLocation={setPrefilledLocation}
          />
        );
      case 'predict':
        return <PredictRiskPage prefilledLocation={prefilledLocation} />;
      case 'map':
        return (
          <AccidentMapPage
            onSelectLocationForPredict={(coords) => {
              setPrefilledLocation({ latitude: coords[0], longitude: coords[1] });
              setActivePage('predict');
            }}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'performance':
        return <ModelPerformancePage />;
      case 'history':
        return <PredictionHistoryPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <DashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar activePage={activePage} />
        <div className="border-b border-amber-400/20 bg-amber-400/10 px-6 py-3 text-xs text-amber-100 md:px-8">
          <div className="mx-auto flex max-w-7xl items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p>
              <span className="font-bold">DEMO DATA:</span> Accident records and model metrics use generated sample data
              centered around Coimbatore. They are not live, verified incident reports. Predictions are estimates for
              the scenario entered.
            </p>
          </div>
        </div>
        <main className="flex-1 py-4">{renderActivePage()}</main>
      </div>
    </div>
  );
}
