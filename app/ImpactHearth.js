import React, { useState } from 'react';

const ImpactHearth = ({ showToast }) => {
  const [progress, setProgress] = useState(72);
  const [outcomeDemo, setOutcomeDemo] = useState(false);

  const simulateOutcome = () => {
    setOutcomeDemo(true);
    showToast('Outcome recorded: Need reduced from HIGH → LOW', 'trending_down');
  };

  return (
    <div className="p-7 flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Impact Hearth</h1>
        <p className="text-outline text-sm mt-1">Verified causal attribution · Ground truthing · Outcome feedback loop</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Impact Ring */}
        <div className="lg:col-span-2 bg-primary-container rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Verified Impact Rate</div>
              <div className="font-serif text-6xl font-semibold">{progress}%</div>
              <div className="text-sm opacity-80 mt-1">↑ 7pts vs Q2 · 1,204 interventions tracked</div>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined fill-icon text-2xl">verified</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-lg font-bold">868</div>
              <div className="text-xs opacity-70">Verified Interventions</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-lg font-bold">336</div>
              <div className="text-xs opacity-70">Pending Verification</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-lg font-bold">12,482</div>
              <div className="text-xs opacity-70">Echo Transmissions</div>
            </div>
          </div>
        </div>

        {/* Causal Delta */}
        <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
          <h3 className="font-serif text-lg font-medium text-primary mb-4">Causal Impact Delta</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Water Security', delta: -0.63, color: 'bg-primary-container' },
              { label: 'Nutrition', delta: -0.36, color: 'bg-primary' },
              { label: 'Maternal Health', delta: -0.44, color: 'bg-secondary' },
              { label: 'Literacy Access', delta: -0.28, color: 'bg-[#727973]' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full" style={{ background: item.color }}></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-outline uppercase tracking-wider">{item.label}</div>
                </div>
                <div className="text-lg font-bold" style={{ color: item.delta < 0 ? '#2d4739' : '#ba1a1a' }}>
                  {item.delta > 0 ? '+' : ''}{item.delta}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary-fixed/50 rounded-lg text-xs text-primary">
            <strong>How we calculate:</strong> Before/after need levels matched by location & time-window. Counterfactual: matched non-intervention clusters.
          </div>
        </div>
      </div>

      {/* Outcome Feedback Loop */}
      <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-medium text-primary">Outcome Feedback Loop</h3>
          <button
            onClick={simulateOutcome}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors"
          >
            Simulate Demo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 1, name: 'Rahul Sawant', location: 'Ward 12', before: 'HIGH', after: outcomeDemo ? 'LOW' : 'PENDING', verified: outcomeDemo },
            { id: 2, name: 'Priya Desai', location: 'Ward 5', before: 'MEDIUM', after: 'LOW', verified: true },
            { id: 3, name: 'Anita Naik', location: 'Ward 8', before: 'HIGH', after: 'MEDIUM', verified: true },
          ].map(item => (
            <div key={item.id} className="bg-[#f5f3f0] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                  {item.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-outline">{item.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.before === 'HIGH' ? 'bg-error-container text-error' : 
                  item.before === 'MEDIUM' ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'
                }`}>{item.before}</span>
                <span className="material-symbols-outlined text-outline">arrow_forward</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.after === 'HIGH' ? 'bg-error-container text-error' : 
                  item.after === 'MEDIUM' ? 'bg-secondary-fixed text-secondary' : 
                  item.after === 'PENDING' ? 'bg-[#eae8e5] text-[#424844]' : 'bg-primary-fixed text-primary'
                }`}>{item.after}</span>
              </div>
              {item.verified && (
                <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                  <span className="material-symbols-outlined fill-icon text-sm">verified</span>
                  Ground truth verified
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ground Truth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
          <h3 className="font-serif text-lg font-medium text-primary mb-4">Ground Truth Protocol</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Follow-up Calls', value: 892, icon: 'phone' },
              { label: 'Photo Verification', value: 456, icon: 'photo_camera' },
              { label: 'Community Feedback', value: 320, icon: 'groups' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-[#f5f3f0] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                <span className="font-bold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary-fixed rounded-xl p-6">
          <h3 className="font-serif text-lg font-medium text-secondary mb-2">Priority Sentinel</h3>
          <p className="text-sm text-[#6e2f00] mb-4">AI-detected risk clusters requiring immediate intervention</p>
          <div className="flex flex-col gap-2">
            <div className="bg-white/50 rounded-lg p-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">Ward 7 Malnutrition Cluster</div>
                <div className="text-xs text-outline">Predicted HIGH risk next 14 days</div>
              </div>
              <button className="px-3 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg">
                Deploy
              </button>
            </div>
            <div className="bg-white/50 rounded-lg p-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">water_drop</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">Water Scarcity Pattern</div>
                <div className="text-xs text-outline">3 wards showing historical pattern</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactHearth;
