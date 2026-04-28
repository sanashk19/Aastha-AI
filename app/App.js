import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import EchoPortal from './pages/EchoPortal';
import CompassMap from './pages/CompassMap';
import ImpactHearth from './pages/ImpactHearth';
import EquityShield from './pages/EquityShield';
import FieldReports from './pages/FieldReports';
import Toast from './components/Toast';

function App() {
  const [toast, setToast] = useState({ show: false, message: '', icon: '' });

  const showToast = (message, icon = 'check_circle') => {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast({ show: false, message: '', icon: '' }), 3000);
  };

  return (
    <div className="flex flex-row min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
            <Route path="/echo" element={<EchoPortal showToast={showToast} />} />
            <Route path="/compass" element={<CompassMap showToast={showToast} />} />
            <Route path="/impact" element={<ImpactHearth showToast={showToast} />} />
            <Route path="/equity" element={<EquityShield showToast={showToast} />} />
            <Route path="/reports" element={<FieldReports showToast={showToast} />} />
          </Routes>
        </div>
      </div>
      <MobileNav />
      {toast.show && <Toast message={toast.message} icon={toast.icon} />}
    </div>
  );
}

export default App;
