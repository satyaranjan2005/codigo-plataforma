"use client";
import React, { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { RefreshCw, Upload, FileText, Users, CheckCircle, AlertCircle, TrendingUp, Plus, Search } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      await post("/problems", { 
        title: title.trim()
      });
      setMessage({ type: "success", text: "Problem statement created successfully." });
      setTitle("");
      setShowForm(false);
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

  // Filter case studies based on search query
  const filteredCaseStudies = caseStudies.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    const title = (c.title || c.name || "").toLowerCase();
    const id = String(c.id || c._id || "").toLowerCase();
    return title.includes(searchLower) || id.includes(searchLower);
  });

  // Calculate stats
  const totalProblems = caseStudies.length;
  const totalTeams = teams.length;
  const teamsWithProblems = teams.filter(t => t.problemStatement || t.problem_statement || t.problem).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Case Study Management</h1>
          <p className="text-slate-600 mt-1">Create and manage problem statements for events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Problems</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalProblems}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Teams</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalTeams}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Teams Registered</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{teamsWithProblems}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Create New Problem Statement</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
              message.type === "error" 
                ? "bg-red-50 border border-red-200" 
                : "bg-green-50 border border-green-200"
            }`}>
              {message.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === "error" ? "text-red-800" : "text-green-800"}`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="E.g., Design a mobile banking app"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Create Problem</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle("");
                  setDescription("");
                  setDifficulty("medium");
                  setMessage(null);
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Problem Statements List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Problem Statements</h2>
            <button
              onClick={loadCaseStudies}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title or ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-3 text-slate-600">Loading problems...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={loadCaseStudies}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredCaseStudies.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">
                {searchQuery ? "No problems found matching your search" : "No problem statements yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create your first problem
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCaseStudies.map((c) => {
                const pid = c.id || c._id || c.problem_id || c.problemId || "";
                return (
                  <div
                    key={pid || c.title}
                    className="p-5 border border-slate-200 rounded-lg hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {c.title || c.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>ID: {pid}</span>
                          {c.createdAt && (
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Team Registrations</h2>
          <p className="text-sm text-slate-600 mt-1">Teams that have selected problem statements</p>
        </div>

        <div className="overflow-x-auto">
          {teamsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-3 text-slate-600">Loading teams...</p>
              </div>
            </div>
          ) : teamsError ? (
            <div className="p-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800">{teamsError}</p>
                  <button
                    onClick={loadTeams}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No teams registered yet</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Problem Statement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {teams.map((t) => {
                  const hasProblem = !!(t.problemStatement || t.problem_statement || t.problem);
                  return (
                    <tr key={t.id || t._id || t.team_name} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {t.team_name || t.name || t.teamName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? '') || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasProblem ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
