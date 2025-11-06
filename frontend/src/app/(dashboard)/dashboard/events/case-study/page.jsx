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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Case Study Management</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">Create and manage problem statements for events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          New Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Total Problems</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{totalProblems}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Total Teams</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{totalTeams}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Teams Registered</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{teamsWithProblems}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Create New Problem Statement</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl"
            >
              ✕
            </button>
          </div>

          {message && (
            <div className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 ${
              message.type === "error" 
                ? "bg-red-50 border border-red-200" 
                : "bg-green-50 border border-green-200"
            }`}>
              {message.type === "error" ? (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
              )}
              <p className={`text-xs sm:text-sm ${message.type === "error" ? "text-red-800" : "text-green-800"}`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                placeholder="E.g., Design a mobile banking app"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                className="px-4 sm:px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Problem Statements List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Problem Statements</h2>
            <button
              onClick={loadCaseStudies}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by title or ID..."
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base">Loading problems...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
                <button
                  onClick={loadCaseStudies}
                  className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredCaseStudies.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-slate-600 text-sm sm:text-base">
                {searchQuery ? "No problems found matching your search" : "No problem statements yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm sm:text-base"
                >
                  Create your first problem
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredCaseStudies.map((c) => {
                const pid = c.id || c._id || c.problem_id || c.problemId || "";
                return (
                  <div
                    key={pid || c.title}
                    className="p-3 sm:p-5 border border-slate-200 rounded-lg hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
                            {c.title || c.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500">
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
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Team Registrations</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Teams that have selected problem statements</p>
        </div>

        <div className="overflow-x-auto">
          {teamsLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <p className="mt-2 sm:mt-3 text-slate-600 text-sm sm:text-base">Loading teams...</p>
              </div>
            </div>
          ) : teamsError ? (
            <div className="p-4 sm:p-6">
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm text-red-800">{teamsError}</p>
                  <button
                    onClick={loadTeams}
                    className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-slate-600 text-sm sm:text-base">No teams registered yet</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden p-4 space-y-3">
                {teams.map((t) => {
                  const hasProblem = !!(t.problemStatement || t.problem_statement || t.problem);
                  return (
                    <div key={t.id || t._id || t.team_name} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm text-slate-900 break-words flex-1">
                          {t.team_name || t.name || t.teamName}
                        </div>
                        {hasProblem ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full ml-2 shrink-0">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-full ml-2 shrink-0">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 break-words">
                        {formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? '') || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <table className="hidden md:table min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Problem Statement
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {teams.map((t) => {
                    const hasProblem = !!(t.problemStatement || t.problem_statement || t.problem);
                    return (
                      <tr key={t.id || t._id || t.team_name} className="hover:bg-slate-50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            {t.team_name || t.name || t.teamName}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="text-sm text-slate-600">
                            {formatTitleField(t.problemStatement ?? t.problem_statement ?? t.problem ?? '') || '—'}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
