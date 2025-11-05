"use client";
import React, { useEffect, useState } from "react";
import api, { get, post } from "@/lib/api";
import { RefreshCw, Upload } from "lucide-react";

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

export default function CaseStudyUploadPage() {
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // teams for problem statements table
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState(null);

  useEffect(() => {
    loadCaseStudies();
    loadTeams();
  }, []);

  async function loadCaseStudies() {
    setLoading(true);
    setError(null);
    try {
      const data = await get("/problems");
      console.log("Loaded case studies:", data);
      // data may be array or { problems: [] }
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setCaseStudies(list);
    } catch (err) {
      console.warn(err);
      setError(err?.message || "Failed to load case studies");
    } finally {
      setLoading(false);
    }
  }

  async function loadTeams() {
    setTeamsLoading(true);
    setTeamsError(null);
    try {
      const data = await get("/teams");
      const list = Array.isArray(data) ? data : Array.isArray(data?.teams) ? data.teams : [];
      setTeams(list);
    } catch (err) {
      console.warn(err);
      setTeamsError(err?.message || "Failed to load teams");
    } finally {
      setTeamsLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    setMessage(null);
    if (!title.trim()) return setMessage({ type: "error", text: "Please enter a title." });
    setUploading(true);
    try {
      // send problem statement to /problems
      // Assumption: backend accepts { problemStatement: string }
      await post("/problems", { title: title.trim() });
      setMessage({ type: "success", text: "Problem statement uploaded successfully." });
      setTitle("");
      // refresh lists and teams table
      loadCaseStudies();
      loadTeams();
    } catch (err) {
      console.error(err);
      const text = err?.message || (err?.response?.data?.message) || "Create failed";
      setMessage({ type: "error", text });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Upload Case Study (one by one)</h2>
        <div className="flex items-center gap-2">
          <button onClick={loadCaseStudies} className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-4 rounded-md shadow-sm max-w-xl">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="Case study title" />
          </div>

          {message && (
            <div className={`text-sm ${message.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>{message.text}</div>
          )}

          <div className="flex items-center gap-2">
            <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <Upload className="h-4 w-4" /> Create
            </button>
            {/* Reset button removed as requested */}
          </div>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-medium">Existing case studies</h3>
        {loading ? (
          <div className="text-sm text-slate-500 mt-2">Loading…</div>
        ) : error ? (
          <div className="text-sm text-rose-600 mt-2">{error}</div>
        ) : caseStudies.length === 0 ? (
          <div className="text-sm text-slate-500 mt-2">No case studies found.</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {caseStudies.map((c) => {
              const pid = c.id || c._id || c.problem_id || c.problemId || "";
              return (
                <li key={pid || c.title} className="bg-white p-3 rounded-md shadow-sm flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-400">ID: {pid}</div>
                    <div className="font-medium">{c.title || c.name}</div>
                    {c.description && <div className="text-sm text-slate-600">{c.description}</div>}
                    <div className="text-xs text-slate-500 mt-1">{c.filename || c.fileName || c.file || ''}</div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(c.createdAt || c.created_at || Date.now()).toLocaleString()}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mt-6">Team Problem Statements</h3>
        {teamsLoading ? (
          <div className="text-sm text-slate-500 mt-2">Loading…</div>
        ) : teamsError ? (
          <div className="text-sm text-rose-600 mt-2">{teamsError}</div>
        ) : teams.length === 0 ? (
          <div className="text-sm text-slate-500 mt-2">No teams found.</div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Team Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Problem Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teams.map((t) => (
                  <tr key={t.id || t._id || t.team_name}>
                    <td className="px-4 py-2 text-sm">{t.team_name || t.name || t.teamName}</td>
                    <td className="px-4 py-2 text-sm">{formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
