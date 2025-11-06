"use client";
import React from "react";

export default function MembersList({ members = [], onDelete, showRole = true }) {
  if (!members || members.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm">
        <p className="text-xs sm:text-sm text-muted-foreground">No members yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{m.name}</h3>
                <p className="text-xs text-gray-500 break-all">{m.email}</p>
              </div>
              <button
                onClick={() => onDelete && onDelete(m.id)}
                className="text-xs text-red-600 hover:text-red-800 font-medium ml-2 shrink-0"
              >
                Delete
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {showRole && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  {m.role || m.roleName || (m.role && m.role.name) || "-"}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                SIC: {m.sic || "-"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden bg-white rounded-md shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                {showRole && (
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                )}
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SIC</th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-900">{m.name}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">{m.email}</td>
                  {showRole && (
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">{m.role || m.roleName || (m.role && m.role.name) || "-"}</td>
                  )}
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-500">{m.sic || "-"}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right text-sm font-medium">
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
      </div>
    </>
  );
}
