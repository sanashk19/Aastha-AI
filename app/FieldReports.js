import React, { useState } from 'react';

const FieldReports = ({ showToast }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const reports = [
    { id: 1, category: 'Food Shortage', location: 'Ward 7, Panjim', urgency: 'HIGH', status: 'unassigned', time: '2 min ago', affected: 45, source: 'Voice' },
    { id: 2, category: 'Medical Emergency', location: 'Ward 5, Margao', urgency: 'HIGH', status: 'assigned', time: '15 min ago', affected: 8, source: 'Voice' },
    { id: 3, category: 'Water Access', location: 'Ward 12, Verna', urgency: 'MEDIUM', status: 'in_progress', time: '1 hour ago', affected: 30, source: 'App' },
    { id: 4, category: 'Sanitation', location: 'Ward 3, Mapusa', urgency: 'MEDIUM', status: 'resolved', time: '3 hours ago', affected: 20, source: 'Voice' },
    { id: 5, category: 'Shelter', location: 'Ward 8, Vasco', urgency: 'LOW', status: 'assigned', time: '5 hours ago', affected: 12, source: 'WhatsApp' },
    { id: 6, category: 'Food Shortage', location: 'Ward 2, Ponda', urgency: 'HIGH', status: 'unassigned', time: '6 hours ago', affected: 60, source: 'Voice' },
    { id: 7, category: 'Medical Emergency', location: 'Ward 15, Candolim', urgency: 'HIGH', status: 'in_progress', time: '8 hours ago', affected: 5, source: 'App' },
    { id: 8, category: 'Education', location: 'Ward 4, Bicholim', urgency: 'LOW', status: 'resolved', time: '1 day ago', affected: 25, source: 'Voice' },
  ];

  const filteredReports = reports.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.location.toLowerCase().includes(search.toLowerCase()) && !r.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'bg-error-container text-error';
      case 'MEDIUM': return 'bg-secondary-fixed text-secondary';
      case 'LOW': return 'bg-primary-fixed text-primary';
      default: return 'bg-[#eae8e5] text-[#424844]';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-primary-fixed text-primary';
      case 'in_progress': return 'bg-secondary-fixed text-secondary';
      case 'assigned': return 'bg-[#eae8e5] text-[#424844]';
      case 'unassigned': return 'bg-error-container text-error';
      default: return 'bg-[#eae8e5] text-[#424844]';
    }
  };

  return (
    <div className="p-7 flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">Field Reports</h1>
          <p className="text-outline text-sm mt-1">All field reports · Filter by status · Export data</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => showToast('Reports exported to CSV', 'download')}
            className="px-4 py-2 border border-primary-container text-primary text-sm font-semibold rounded-lg hover:bg-[#f0edea] transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <button 
            onClick={() => showToast('New report form opened', 'add')}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
          <input
            type="text"
            placeholder="Search by location or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e4e2df] rounded-lg text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'unassigned', 'assigned', 'in_progress', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-[#e4e2df] text-[#424844] hover:bg-[#f5f3f0]'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: 156, color: 'text-primary' },
          { label: 'Unassigned', value: 23, color: 'text-error' },
          { label: 'In Progress', value: 41, color: 'text-secondary' },
          { label: 'Resolved Today', value: 18, color: 'text-primary-container' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-[#e4e2df] text-center">
            <div className={`font-serif text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-outline mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e4e2df] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f5f3f0]">
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">ID</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Category</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Location</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Urgency</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Time</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Affected</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Source</th>
                <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-outline">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-t border-[#e4e2df] hover:bg-[#f5f3f0]/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-outline">#{report.id.toString().padStart(4, '0')}</td>
                  <td className="py-4 px-4 font-semibold">{report.category}</td>
                  <td className="py-4 px-4">{report.location}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getUrgencyColor(report.urgency)}`}>
                      {report.urgency}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-outline">{report.time}</td>
                  <td className="py-4 px-4 font-semibold">{report.affected}</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-outline">
                        {report.source === 'Voice' ? 'mic' : report.source === 'WhatsApp' ? 'chat' : 'app_registration'}
                      </span>
                      {report.source}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => showToast(`Viewing report #${report.id}`, 'visibility')}
                        className="p-1.5 hover:bg-[#f0edea] rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-outline">visibility</span>
                      </button>
                      {report.status === 'unassigned' && (
                        <button 
                          onClick={() => showToast(`Assigned volunteer to report #${report.id}`, 'person_add')}
                          className="p-1.5 hover:bg-primary-fixed rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg text-primary">person_add</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReports.length === 0 && (
          <div className="p-8 text-center text-outline">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p>No reports match your filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-outline">Showing {filteredReports.length} of {reports.length} reports</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-[#e4e2df] rounded-lg text-sm text-outline hover:bg-[#f5f3f0] transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary-container transition-colors">
            1
          </button>
          <button className="px-3 py-1.5 border border-[#e4e2df] rounded-lg text-sm text-outline hover:bg-[#f5f3f0] transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 border border-[#e4e2df] rounded-lg text-sm text-outline hover:bg-[#f5f3f0] transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldReports;
