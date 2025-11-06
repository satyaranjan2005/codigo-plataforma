"use client";
import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import api, { get } from "@/lib/api";

// Safely format a problem/title-like value into a display string.
function formatTitleField(val) {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    const candidate = val.title ?? val.name ?? val.problemStatement ?? val.problem ?? val.description;
    if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
    if (candidate && typeof candidate === "object") {
      const nested = candidate.en || candidate.en_us || candidate.default || candidate.text;
      if (nested && (typeof nested === "string" || typeof nested === "number")) return String(nested);
    }
    try { return JSON.stringify(val); } catch (e) { return String(val); }
  }
  return String(val);
}

export default function RegistrationPage() {
  // Teams state
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Users index to resolve member IDs (SIC) to names/emails
  const [userIndex, setUserIndex] = useState({});
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  async function loadTeams() {
    setLoading(true);
    setError(null);
    try {
      // use api helper get() which returns response.data
      const data = await get("/teams");
      console.log("Teams data:", data);
      const list = Array.isArray(data) ? data : Array.isArray(data?.teams) ? data.teams : [];
      setTeams(list);
    } catch (err) {
      console.warn("Failed to load teams:", err);
      setError(err?.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  async function loadUsers() {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await api.get("/users");
      const data = res?.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      // Build an index so we can resolve members that are plain IDs/SIC strings
      const idx = {};
      list.forEach((u) => {
        const uobj = {
          id: u.sic_no || u.id || u.sic || u.email,
          name: u.name || u.full_name || "",
          email: u.email || "",
          sic: u.sic_no || u.sic || u.id || "",
          phone: u.phone || u.phone_number || u.mobile || u.contact || u.phone_no || "",
        };
        // index by multiple possible identifiers
        [u.sic_no, u.sic, u.id, u.email, u.phone_no, uobj.id].filter(Boolean).forEach((k) => {
          idx[String(k)] = uobj;
        });
      });
      setUserIndex(idx);
    } catch (err) {
      console.warn("Failed to load users:", err);
      setUsersError(err?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  // --- Export helpers: CSV and printable HTML (PDF via print) ---
  function escapeCsvCell(s) {
    if (s === null || s === undefined) return "";
    const str = String(s);
    return '"' + str.replace(/"/g, '""') + '"';
  }

  function getMemberRecord(team, m) {
    const isString = typeof m === "string";
    const user = isString ? (userIndex[m] || {}) : m || {};
    const name = isString ? (user.name || m) : (m.name || m.full_name || "");
    const role = isString ? (user.role || user.roleName || "") : (m.role || m.roleName || "");
    const sic = isString ? (user.sic || m) : (m.sic_no || m.sic || m.id || "");
    const phone = isString
      ? (user.phone || user.phone_number || user.mobile || user.contact || user.phone_no || "")
      : (m.phone_no || m.phone || m.phone_number || m.mobile || m.contact || "");
    const email = isString ? (user.email || "") : (m.email || "");
    return {
      teamId: team.id || team.team_id || "",
      teamName: team.team_name || team.name || team.teamName || "",
      problem: formatTitleField(team.problemStatement ?? team.problem_statement ?? team.problem ?? team.statement ?? ""),
      memberName: name,
      memberRole: role,
      memberSIC: sic,
      memberPhone: phone,
      memberEmail: email,
    };
  }

  function exportTeamsCSV() {
    if (!teams || teams.length === 0) return;
  const headers = ["Team ID", "Team Name", "Problem Statement", "Member Name", "Member Role", "Member SIC", "Member Phone"];
    const rows = [];
    teams.forEach((t) => {
      const tMembers = Array.isArray(t.members) ? t.members : Array.isArray(t.users) ? t.users : [];
      if (tMembers.length === 0) {
        rows.push([t.id || "", t.team_name || t.name || "", formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? t.statement ?? ""), "", "", "", ""]);
      } else {
        tMembers.forEach((m) => {
          const r = getMemberRecord(t, m);
          rows.push([r.teamId, r.teamName, r.problem, r.memberName, r.memberRole, r.memberSIC, r.memberPhone]);
        });
      }
    });
    const csv = [headers, ...rows].map((r) => r.map(escapeCsvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teams.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function exportTeamsPDF() {
    if (!teams || teams.length === 0) return;
    const win = window.open("", "_blank");
    if (!win) {
      alert("Popup blocked: please allow popups for this site to export PDF.");
      return;
    }
    const style = `
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
        h2 { margin-bottom: 0.25rem; }
        .team { margin-bottom: 18px; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
      </style>
    `;
    const content = teams
      .map((t, idx) => {
        const name = escapeHtml(t.team_name || t.name || t.teamName || `Team ${idx + 1}`);
  const prob = escapeHtml(formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? t.statement ?? ""));
        const tMembers = Array.isArray(t.members) ? t.members : Array.isArray(t.users) ? t.users : [];
        const rows = tMembers
          .map((m) => {
            const rec = getMemberRecord(t, m);
            return `<tr><td>${escapeHtml(rec.memberName)}</td><td>${escapeHtml(rec.memberRole)}</td><td>${escapeHtml(rec.memberSIC)}</td><td>${escapeHtml(rec.memberPhone)}</td></tr>`;
          })
          .join("");
        return `<div class="team"><h2>${name}</h2><div><strong>Problem:</strong> ${prob || "-"} </div><table><thead><tr><th>Name</th><th>Role</th><th>SIC</th><th>Phone</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      })
      .join("");

    // Inject a small script into the new window that triggers print after the content loads.
    const printScript = `
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() { try { window.print(); } catch(e) { console.warn('Print error', e); } }, 200);
        });
      <\/script>`;

    const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${content}${printScript}</body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold">Teams</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button onClick={loadTeams} className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs sm:text-sm flex-1 sm:flex-initial justify-center">
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Refresh
          </button>
          <button onClick={exportTeamsCSV} className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs sm:text-sm flex-1 sm:flex-initial">CSV</button>
          <button onClick={exportTeamsPDF} className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-xs sm:text-sm flex-1 sm:flex-initial">PDF</button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm text-center text-sm sm:text-base">Loading teams…</div>
      ) : error ? (
        <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm text-center text-rose-600 text-sm sm:text-base">{error}</div>
      ) : teams.length === 0 ? (
        <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm text-center text-slate-500 text-sm sm:text-base">No teams yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {teams.map((t, idx) => {
            const name = t.team_name || t.name || t.teamName || `Team ${idx + 1}`;
            const tMembers = Array.isArray(t.members) ? t.members : Array.isArray(t.users) ? t.users : [];
            const problem = formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? t.statement ?? "");
            return (
              <div key={name + idx} className="bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="text-base sm:text-lg font-semibold break-words flex-1">{name}</div>
                  <div className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">{tMembers.length} member{tMembers.length !== 1 ? "s" : ""}</div>
                </div>
                {problem && (
                  <div className="mt-1.5 sm:mt-1 text-xs sm:text-sm text-slate-700">
                    <span className="font-medium">Problem Statement:</span>{" "}
                    <span className="line-clamp-2">{problem}</span>
                  </div>
                )}
                <div className="mt-3 divide-y">
                  {tMembers.length === 0 ? (
                    <div className="text-xs sm:text-sm text-slate-500">No members.</div>
                  ) : (
                    tMembers.map((m) => {
                      const isString = typeof m === "string";
                      // If member is a string (sic/id) resolve via userIndex, otherwise use the member object directly
                      const user = isString ? (userIndex[m] || {}) : m || {};
                      const key = isString ? (user.sic || m) : (m.sic_no || m.sic || m.id || m.email || Math.random());
                      const displayName = isString ? (user.name || m) : (m.name || m.full_name || m.sic_no || m.sic || "");
                      const email = isString ? (user.email || "") : (m.email || "");
                      const phone = isString
                        ? (user.phone || user.phone_number || user.mobile || user.contact || user.phone_no || "")
                        : (m.phone_no || m.phone || m.phone_number || m.mobile || m.contact || "");
                      const sic = isString ? (user.sic || m) : (m.sic_no || m.sic || m.id || "");
                      const role = isString
                        ? (user.role || user.roleName || "")
                        : (m.role || m.roleName || "");
                      return (
                        <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 gap-1 sm:gap-0">
                          <div className="flex-1 w-full sm:w-auto">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <div className="font-medium text-sm sm:text-base break-words">{displayName}</div>
                              {role && (
                                <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">{String(role)}</span>
                              )}
                            </div>
                            <div className="text-[10px] sm:text-xs text-slate-500 flex flex-wrap gap-x-2 mt-0.5">
                              {email && <span className="break-all">{email}</span>}
                              {phone && <span className="text-slate-600 whitespace-nowrap">• {phone}</span>}
                            </div>
                          </div>
                          <div className="text-[10px] sm:text-xs text-slate-600 mt-1 sm:mt-0 self-end sm:self-auto">{sic}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {(usersLoading || usersError) && (
        <div className="text-[10px] sm:text-xs text-slate-500">
          {usersLoading ? "Loading member details…" : usersError}
        </div>
      )}
    </div>
  );
}
