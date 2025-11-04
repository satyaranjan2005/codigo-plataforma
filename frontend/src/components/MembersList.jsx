"use client";
import React from "react";

export default function MembersList({ members = [], onDelete, showRole = true }) {
  if (!members || members.length === 0) {
    return (
      <div className="p-6 bg-white rounded-md shadow-sm">
        <p className="text-sm text-muted-foreground">No members yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-md shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            {showRole && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SIC</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((m) => (
            <tr key={m.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.email}</td>
                {showRole && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.role || m.roleName || (m.role && m.role.name) || "-"}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.sic || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onDelete && onDelete(m.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
