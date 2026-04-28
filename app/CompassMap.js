import React, { useState } from 'react';

const MapPin = ({ top, left, icon, color, title, subtitle, action, onClick, isNeglect }) => (
  <div 
    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
    style={{ top, left }}
    onClick={onClick}
  >
    <div className={`w-7 h-7 rounded-full border-[3px] border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-125 ${
      isNeglect ? 'animate-[pulse-danger_2.5s_ease-in-out_infinite]' : ''
    }`} style={{ backgroundColor: color }}>
      <span className="material-symbols-outlined fill-icon text-white text-sm">{icon}</span>
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      <div className="bg-white rounded-xl p-3 shadow-xl border border-[#e4e2df]">
        <div className="font-bold text-sm mb-1" style={{ color }}>{title}</div>
        <div className="text-xs text-outline mb-2">{subtitle}</div>
        {action && (
          <button className="w-full py-1.5 text-white text-xs font-bold rounded-md" style={{ backgroundColor: color }}>
            {action}
          </button>
        )}
      </div>
    </div>
  </div>
);

const VolunteerCard = ({ initials, bg, name, subtitle, match, skills, onDeploy }) => (
  <div className="bg-white rounded-xl p-4 border border-[#e4e2df] hover:shadow-md transition-shadow">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${bg}`}>{initials}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-primary">{name}</div>
        <div className="text-xs text-outline">{subtitle}</div>
      </div>
      <div className="text-right">
        <div className="font-serif text-xl font-bold text-primary">{match}<span className="text-xs">%</span></div>
        <div className="text-[8px] font-bold uppercase tracking-wider text-outline">Match</div>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5 mb-3">
      {skills.map((skill, i) => (
        <span key={i} className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
          skill.type === 'primary' ? 'bg-primary-fixed text-primary' : 'bg-[#eae8e5] text-[#424844]'
        }`}>{skill.label}</span>
      ))}
    </div>
    <button 
      onClick={onDeploy}
      className="w-full py-2 bg-primary-container text-white text-xs font-bold rounded-lg hover:bg-primary transition-colors"
    >
      Deploy to Ward
    </button>
  </div>
);

const CompassMap = ({ showToast }) => {
  const [showBanner, setShowBanner] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const deployVol = (name) => {
    showToast(`${name} deployed to Ward 12`, 'volunteer_activism');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative bg-[#d4c9b0]">
        {/* Banner */}
        {showBanner && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-secondary-fixed text-secondary px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              <span className="text-sm font-semibold">Rural wards receiving 40% fewer assignments than urban — review allocation</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-xs font-bold underline hover:text-primary transition-colors">ADJUST BIAS FILTER</button>
              <button onClick={() => setShowBanner(false)} className="p-0.5">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        )}

        {/* SVG Map */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="urbanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4c9b0" />
              <stop offset="100%" stopColor="#bfb49a" />
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#urbanGlow)" />
          {/* Roads */}
          <path d="M0,300 Q200,280 400,300 Q600,320 800,300" stroke="#c4b98a" strokeWidth="6" fill="none" opacity="0.7"/>
          <path d="M400,0 Q380,150 400,300 Q420,450 400,600" stroke="#c4b98a" strokeWidth="6" fill="none" opacity="0.7"/>
          {/* Zones */}
          <rect x="80" y="80" width="160" height="120" rx="8" fill="#bfb49a" opacity="0.6"/>
          <rect x="300" y="60" width="200" height="160" rx="8" fill="#b5aa90" opacity="0.7"/>
          <rect x="540" y="100" width="180" height="140" rx="8" fill="#bfb49a" opacity="0.6"/>
          {/* Labels */}
            <text x="160" y="145" textAnchor="middle" fontSize="10" fill="#6e5f42" opacity="0.7">Ward 3</text>
            <text x="400" y="145" textAnchor="middle" fontSize="10" fill="#6e5f42" opacity="0.7">Ward 5</text>
            <text x="630" y="175" textAnchor="middle" fontSize="10" fill="#6e5f42" opacity="0.7">Ward 8</text>
            <text x="150" y="420" textAnchor="middle" fontSize="10" fill="#6e5f42" opacity="0.7">Ward 12</text>
            <text x="640" y="445" textAnchor="middle" fontSize="10" fill="#6e5f42" opacity="0.7">Ward 15</text>
        </svg>

        {/* Heatmap Overlay */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-32 h-32 rounded-full top-[25%] left-[18%] bg-secondary/40 blur-2xl"></div>
            <div className="absolute w-24 h-24 rounded-full top-[35%] left-[62%] bg-secondary/25 blur-2xl"></div>
            <div className="absolute w-20 h-20 rounded-full top-[68%] left-[75%] bg-primary-container/25 blur-2xl"></div>
          </div>
        )}

        {/* Map Pins */}
        <MapPin top="28%" left="22%" icon="error" color="#99460a" title="Ward 12 — HIGH NEGLECT" subtitle="7 pending medical requests · Unmet 48h" action="ASSIGN VOLUNTEER" isNeglect />
        <MapPin top="55%" left="42%" icon="volunteer_activism" color="#173124" title="Rahul Sawant" subtitle="Active · 1.2km from Ward 12 · Medical" />
        <MapPin top="38%" left="65%" icon="warning" color="#99460a" title="Ward 8 — MEDIUM" subtitle="3 water access reports · 24h unresolved" action="REVIEW" />
        <MapPin top="72%" left="78%" icon="check_circle" color="#2d4739" title="Ward 15 — Resolved" subtitle="Food kit deployed today · Need → LOW" />

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 w-52 shadow-lg border border-[#e4e2df]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Map Layers</h3>
            <div className="flex flex-col gap-2">
              {['Neglected Zones', 'Active Volunteers', 'Need Heatmap'].map((layer, i) => (
                <label key={layer} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-[#424844]">{layer}</span>
                  <button 
                    onClick={() => layer === 'Need Heatmap' && setShowHeatmap(!showHeatmap)}
                    className={`w-8 h-4 rounded-full relative transition-colors ${
                      layer === 'Need Heatmap' ? (showHeatmap ? 'bg-primary-container' : 'bg-[#c2c8c2]') : 'bg-primary-container'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                      layer === 'Need Heatmap' ? (showHeatmap ? 'right-0.5' : 'left-0.5') : 'right-0.5'
                    }`}></div>
                  </button>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 w-52 shadow-lg border border-[#e4e2df]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">SDG 10 Compliance</span>
            </div>
            <p className="text-xs text-[#424844] leading-relaxed">2 zones with 3+ unmet requests flagged by Equity Shield</p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-1.5">
          {['add', 'remove', 'my_location'].map(icon => (
            <button key={icon} className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center hover:bg-[#f5f3f0] transition-colors">
              <span className="material-symbols-outlined text-lg text-[#424844]">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-shrink-0 border-l border-[#e4e2df] bg-[#f5f3f0] p-5 flex-col gap-4 overflow-y-auto">
        <div>
          <h2 className="font-serif text-xl font-medium text-primary">Volunteer Matching</h2>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-1">Priority: Neglected Zones</p>
        </div>

        <div className="flex flex-col gap-3">
          <VolunteerCard
            initials="RS"
            bg="bg-primary-container text-white"
            name="Rahul Sawant"
            subtitle="Medical Aid · Panjim · 1.2km"
            match={94}
            skills={[{ label: 'Medical', type: 'primary' }, { label: 'Hindi / Konkani', type: 'neutral' }, { label: '2-Wheeler', type: 'neutral' }]}
            onDeploy={() => deployVol('Rahul Sawant')}
          />
          <VolunteerCard
            initials="PD"
            bg="bg-primary-fixed text-primary"
            name="Priya Desai"
            subtitle="Nutrition Specialist · Margao · 3.4km"
            match={88}
            skills={[{ label: 'Nutrition', type: 'primary' }, { label: 'Marathi', type: 'neutral' }]}
            onDeploy={() => deployVol('Priya Desai')}
          />
          <VolunteerCard
            initials="AN"
            bg="bg-secondary-fixed text-secondary"
            name="Anita Naik"
            subtitle="Sanitation · Verna · 5.1km"
            match={81}
            skills={[{ label: 'Sanitation', type: 'neutral' }, { label: 'Konkani', type: 'neutral' }]}
            onDeploy={() => deployVol('Anita Naik')}
          />
        </div>

        <div className="mt-auto pt-4 border-t border-[#e4e2df]">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Ground Capacity</span>
            <span className="text-xs font-bold text-primary">76%</span>
          </div>
          <div className="h-1.5 bg-[#e4e2df] rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: '76%' }}></div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CompassMap;
