import React from 'react';

// Winner component
// Props:
// - winners: array of { position: 1|2|3, teamName, members: [{name, sic_no}], prize }
// If no winners prop is provided, component shows a default placeholder winners list.

export default function Winner({ winners }) {
  const list = Array.isArray(winners)
    ? winners
    : [
        {
          position: 1,
          teamName: 'Team UXified',
          members: [
            { name: 'Barsha Priyadarshini Tanty', sic_no: '23BCSN23' },
            { name: 'Sukanya Kabi', sic_no: '23BCSN24' },
            { name: 'Milan Nayak', sic_no: '23BCSN09' },
          ],
          prize: '1,500',
        },
        {
          position: 2,
          teamName: 'Team Doremon',
          members: [
            { name: 'Akash Kumar Gosain', sic_no: '23BCSN35' },
            { name: 'Mamali Rout', sic_no: '23BCSN18' },
            { name: 'Subham Panigrahi', sic_no: '23BCSN16' },
          ],
          prize: '1,000',
        },
        {
          position: 3,
          teamName: 'Team Design Crew',
          members: [
            { name: 'Sneha Routray', sic_no: '23BCSN12' },
            { name: 'Bivan Jena', sic_no: '23BCSN36' },
            { name: 'Aryan Kumar Singh', sic_no: '23BCSN56' },
          ],
          prize: '500',
        },
      ];

  const medalColor = (pos) => {
    if (pos === 1) return 'bg-amber-400 text-amber-900';
    if (pos === 2) return 'bg-slate-200 text-slate-800';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <section className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold">Design Mania — Winners</h2>
      <p className="text-sm text-slate-600 mt-1">Congratulations to the winners of Design Mania.</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {list.map((w) => (
          <div key={w.position} className="border rounded-lg p-3 flex flex-col items-start gap-2">
            <div className={`inline-flex items-center px-2 py-1 rounded ${medalColor(w.position)} font-semibold text-sm`}>
              {w.position === 1 ? '🥇 1st' : w.position === 2 ? '🥈 2nd' : '🥉 3rd'}
            </div>
            <div className="mt-2 text-sm sm:text-base font-semibold">{w.teamName}</div>
            <div className="text-xs sm:text-sm text-slate-600 mt-1">
              {w.members && w.members.length > 0 ? (
                <ul className="list-disc list-inside">
                  {w.members.map((m, i) => (
                    <li key={i}>{m.name || m.sic_no} <span className="text-[11px] text-slate-400">{m.sic_no ? `(${m.sic_no})` : ''}</span></li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500">Team members not listed</span>
              )}
            </div>
            <div className="mt-3 text-sm text-slate-700">Prize: <span className="font-semibold">₹{w.prize}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
