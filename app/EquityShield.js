import React, { useState } from 'react';

const EquityShield = ({ showToast }) => {
  const [ruralAlloc, setRuralAlloc] = useState(14);
  const [showAutoBalance, setShowAutoBalance] = useState(false);

  const autoBalance = () => {
    setShowAutoBalance(true);
    setTimeout(() => {
      setRuralAlloc(34);
      showToast('12 assignments redistributed to rural wards (+20%)', 'balance');
    }, 500);
  };

  return (
    <div className="p-7 flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">Equity Shield</h1>
          <p className="text-outline text-sm mt-1">SDG 10 compliance · Bias detection · Auto-correction</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed text-primary text-sm font-bold">
          <span className="material-symbols-outlined fill-icon">shield</span>
          SDG 10 Compliant
        </div>
      </div>

      {/* Geographic Bias */}
      <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif text-lg font-medium text-primary">Geographic Distribution Bias</h3>
          <button
            onClick={autoBalance}
            disabled={showAutoBalance}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
            {showAutoBalance ? 'Balanced' : 'Auto-Balance Allocation'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { zone: 'Urban Core', assignments: 87, percent: 58, color: '#2d4739', status: 'optimal' },
            { zone: 'Peri-Urban', assignments: 42, percent: 28, color: '#727973', status: 'acceptable' },
            { zone: 'Rural', assignments: ruralAlloc === 14 ? 21 : 51, percent: ruralAlloc === 14 ? 14 : 34, color: '#99460a', status: ruralAlloc === 14 ? 'under_served' : 'balanced' },
          ].map(item => (
            <div key={item.zone} className="bg-[#f5f3f0] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-outline uppercase tracking-wider">{item.zone}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  item.status === 'under_served' ? 'bg-error-container text-error' : 
                  item.status === 'balanced' ? 'bg-primary-fixed text-primary' : 'bg-[#eae8e5] text-[#424844]'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <div className="font-serif text-3xl font-semibold mb-1" style={{ color: item.color }}>{item.assignments}</div>
              <div className="text-xs text-outline mb-3">{item.percent}% of total</div>
              <div className="h-3 bg-[#e4e2df] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {ruralAlloc === 14 && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-error-container/30 rounded-xl border border-error-container">
            <span className="material-symbols-outlined text-error">warning</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-error">Rural zones receiving 40% fewer assignments than urban</div>
              <div className="text-xs text-error/70">SDG 10 alert: Inequality detected in geographic distribution</div>
            </div>
            <button onClick={autoBalance} className="px-4 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/80 transition-colors">
              Fix Now
            </button>
          </div>
        )}

        {showAutoBalance && ruralAlloc > 14 && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-primary-fixed rounded-xl border border-primary-fixed-dim animate-[fadeIn_0.5s_ease]">
            <span className="material-symbols-outlined fill-icon text-primary">check_circle</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-primary">Auto-balancing complete</div>
              <div className="text-xs text-primary/70">12 volunteers redistributed. New disparity ratio: 1.45 (was 2.07)</div>
            </div>
            <span className="text-sm font-bold text-primary">+29% equity</span>
          </div>
        )}
      </div>

      {/* Gender & Language Equity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
          <h3 className="font-serif text-lg font-medium text-primary mb-4">Gender Representation</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Male Volunteers', percent: 68, color: '#2d4739' },
              { label: 'Female Volunteers', percent: 28, color: '#99460a' },
              { label: 'Other / Prefer not to say', percent: 4, color: '#727973' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-bold">{item.percent}%</span>
                </div>
                <div className="h-2 bg-[#e4e2df] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-secondary-fixed/30 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-secondary">info</span>
              <span className="text-secondary">Rural female volunteer participation below 30% target</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
          <h3 className="font-serif text-lg font-medium text-primary mb-4">Language Accessibility</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { lang: 'Hindi', percent: 94, status: 'excellent' },
              { lang: 'Marathi', percent: 91, status: 'good' },
              { lang: 'Konkani', percent: 88, status: 'good' },
              { lang: 'English', percent: 96, status: 'excellent' },
            ].map(item => (
              <div key={item.lang} className="bg-[#f5f3f0] rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-primary">{item.percent}%</div>
                <div className="text-xs font-semibold text-outline uppercase tracking-wider">{item.lang}</div>
                <div className={`text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block ${
                  item.status === 'excellent' ? 'bg-primary-fixed text-primary' : 'bg-secondary-fixed text-secondary'
                }`}>{item.status}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-outline">Speech-to-text accuracy by language. All languages exceed 85% threshold.</p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl p-6 border border-[#e4e2df]">
        <h3 className="font-serif text-lg font-medium text-primary mb-4">Equity Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e4e2df]">
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-outline">Date</th>
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-outline">Issue Detected</th>
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-outline">Action Taken</th>
                <th className="text-left py-3 px-3 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Today', issue: 'Rural under-allocation', action: 'Auto-redistributed 12 volunteers', status: 'resolved' },
                { date: '2 days ago', issue: 'Gender imbalance in Ward 7', action: 'Prioritized female volunteer assignment', status: 'resolved' },
                { date: '1 week ago', issue: 'Language barrier reported', action: 'Added Konkani translator', status: 'resolved' },
              ].map((item, i) => (
                <tr key={i} className="border-b border-[#e4e2df] last:border-0">
                  <td className="py-3 px-3 text-outline">{item.date}</td>
                  <td className="py-3 px-3 font-semibold">{item.issue}</td>
                  <td className="py-3 px-3">{item.action}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary-fixed text-primary">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EquityShield;
