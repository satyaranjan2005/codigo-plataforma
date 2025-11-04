"use client";
import React from "react";
import MembersList from "./MembersList";

export default function TeamMembers({ members = [], onDelete }) {
  // Group members by `team` property; fall back to 'Unassigned'
  const groups = members.reduce((acc, m) => {
    const team = m.team || "Unassigned";
    if (!acc[team]) acc[team] = [];
    acc[team].push(m);
    return acc;
  }, {});

  const teamNames = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  if (teamNames.length === 0) {
    return (
      <div className="p-6 bg-white rounded-md shadow-sm">
        <p className="text-sm text-muted-foreground">No members available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teamNames.map((team) => (
        <section key={team} className="bg-white rounded-md shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">{team}</h3>
            <div className="text-sm text-gray-500">{groups[team].length} member{groups[team].length !== 1 ? "s" : ""}</div>
          </div>

          <MembersList members={groups[team]} onDelete={onDelete} />
        </section>
      ))}
    </div>
  );
}
