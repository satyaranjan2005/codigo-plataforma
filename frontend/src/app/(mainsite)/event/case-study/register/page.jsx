"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";

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

function ProblemPicker({ problems = [], value, onChange, onRefresh }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const selected = problems.find(p => String(p.id ?? p._id ?? p.problem_id ?? p.problemId ?? "") === String(value)) || null;
  const selectedLabel = value
    ? `${formatTitleField(selected?.title ?? selected?.name ?? selected?.problemStatement ?? selected?.problem ?? selected) || '—'} — ${value}`
    : null;

  return (
    <div className="relative w-full" ref={ref}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOpen(o => !o)} className="mt-1 w-full text-left rounded-md border px-3 py-2 bg-white">
          <span className="text-sm">{selectedLabel || '-- Select a problem --'}</span>
        </button>
        <button type="button" onClick={onRefresh} className="mt-1 px-3 py-2 border rounded-md text-sm">Refresh</button>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-auto">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b bg-slate-50 text-xs text-slate-600">
            <div className="col-span-3 font-medium">ID</div>
            <div className="col-span-9 font-medium">Title</div>
          </div>
          {problems.map((p) => {
            const id = p.id ?? p._id ?? p.problem_id ?? p.problemId ?? "";
            const title = formatTitleField(p.title ?? p.name ?? p.problemStatement ?? p.problem ?? p) || `Problem ${id}`;
            return (
              <button
                key={id || title}
                type="button"
                onClick={() => { onChange(String(id)); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-3 text-xs text-slate-700 truncate">{id}</div>
                <div className="col-span-9 text-sm text-slate-800 truncate">{title}</div>
              </button>
            );
          })}
          {problems.length === 0 && (
            <div className="p-3 text-sm text-slate-500">No problems available.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CaseStudyRegisterPage() {
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemsError, setProblemsError] = useState(null);
  // start with server-consistent initial value and hydrate on mount
  const [authUser, setAuthUser] = useState(null);

  const [problemId, setProblemId] = useState("");
  const [teamInfo, setTeamInfo] = useState(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [checkingLeader, setCheckingLeader] = useState(true);

  // derived selected problem for easier rendering
    const selectedProblem = (problems || []).find(
      (p) => String(p.id ?? p._id ?? p.problem_id ?? p.problemId ?? "") === String(problemId)
    ) || null;

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProblems();
    function onAuthChange() {
      try {
        const raw = localStorage.getItem("authUser");
        setAuthUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setAuthUser(null);
      }
    }
    // initialize authUser on client mount to avoid SSR/client markup mismatch
    onAuthChange();
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", (e) => { if (e.key === "authUser") onAuthChange(); });
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      // storage listener not removed because it was an anonymous wrapper; it's fine for short-lived page
    };
  }, []);

  // when authUser changes, try to lookup their team by SIC number
  useEffect(() => {
    let mounted = true;
    async function loadTeamForUser(u) {
      setCheckingLeader(true);
      if (!u) {
        if (mounted) {
          setTeamInfo(null);
          setIsTeamLeader(false);
          setCheckingLeader(false);
        }
        return;
      }
      // try a few common sic fields
      const sic = u.sic || u.sic_no || u.sicNo || u.SIC || u.sicNumber || u.sic_number || u.id;
      if (!sic) {
        if (mounted) {
          setTeamInfo(null);
          setIsTeamLeader(false);
          setCheckingLeader(false);
        }
        return;
      }
      // First check localStorage for leader status (set during registration)
      let leaderFound = false;
      try {
        const rawLast = typeof window !== 'undefined' ? localStorage.getItem('lastSavedTeam') : null;
        if (rawLast) {
          const last = JSON.parse(rawLast);
          if (last.isLeader === true) {
            leaderFound = true;
            console.log('[Case Study Register] Leader found from localStorage');
          }
        }
      } catch (e) {
        console.warn('[Case Study Register] Error reading localStorage:', e);
      }
      
      // If not leader from localStorage, block access immediately
      if (!leaderFound) {
        console.log('[Case Study Register] Not a leader - redirecting to /event');
        if (mounted) {
          setIsTeamLeader(false);
          setCheckingLeader(false);
        }
        // Redirect non-leaders immediately
        router.replace('/event');
        return;
      }
      
      // If leader, proceed to load team info from API
      try {
        const res = await get(`/teams/member/${encodeURIComponent(String(sic))}`);
        const data = res?.data || res;
        const team = Array.isArray(data) ? data[0] : (data?.team || data?.teams?.[0] || data);
        if (mounted) {
          setTeamInfo(team || null);
          setIsTeamLeader(true);
          setCheckingLeader(false);
        }
      } catch (err) {
        console.warn("Failed to load team for user SIC:", err);
        if (mounted) {
          setTeamInfo(null);
          setIsTeamLeader(true); // Keep them as leader even if API fails
          setCheckingLeader(false);
        }
      }
    }
    loadTeamForUser(authUser);
    return () => { mounted = false; };
  }, [authUser, router]);

  async function loadProblems() {
    setLoadingProblems(true);
    setProblemsError(null);
    try {
      // Prefer available problems endpoint for dropdown; fall back to /problems
      let data;
      try {
        data = await get("/problems/available");
      } catch (e) {
        data = await get("/problems");
      }
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setProblems(list);
      // Do not auto-select the first problem. Show a placeholder instead.
    } catch (err) {
      console.warn(err);
      setProblemsError(err?.message || "Failed to load problems");
    } finally {
      setLoadingProblems(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
  if (!problemId) return setMessage({ type: "error", text: "Please select a problem." });
    // prefer team id from the team lookup, otherwise fall back to authUser fields
    const teamIdFromLookup = teamInfo && (teamInfo.id || teamInfo._id || teamInfo.team_id || teamInfo.teamId);
    const teamIdFallback = authUser && (authUser.team_id || authUser.teamId || authUser.team || (authUser.team && (authUser.team.id || authUser.team._id || authUser.team.team_id)));
    const teamId = teamIdFromLookup || teamIdFallback;
    if (!teamId) {
      return setMessage({ type: "error", text: "No team associated with your account. Please join or create a team before registering." });
    }

    const pid = Number(problemId);
    if (Number.isNaN(pid)) {
      return setMessage({ type: "error", text: "Selected problem id is not a number." });
    }

    setSubmitting(true);
    try {
      // Call POST /teams/:id/register with { problem_id: number }
      await post(`/teams/${teamId}/register`, { problem_id: pid });
      setMessage({ type: "success", text: "Team registered for the case study successfully." });
      // Redirect to event page after successful registration
      try { router.push('/event'); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.message || err?.message || "Registration failed";
      setMessage({ type: "error", text });
    } finally {
      setSubmitting(false);
    }
  }

  // If team is already registered for a problem, redirect away from this page.
  useEffect(() => {
    if (!teamInfo) return;
    const registered = Boolean(
      teamInfo.problem_id || teamInfo.problemId || teamInfo.problem || teamInfo.problemStatement || teamInfo.registered || teamInfo.registered_for_case_study
    );
    if (registered) {
      try { router.replace('/event'); } catch (e) { /* ignore */ }
    }
  }, [teamInfo, router]);

  // Show loading state while checking if user is team leader
  if (checkingLeader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-lg text-slate-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not a team leader
  if (!isTeamLeader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            Only team leaders can register for case studies. Please contact your team leader to complete the registration.
          </p>
          <button
            onClick={() => router.push('/event')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Register for Case Study</h1>
      {authUser && (
        <div className="text-sm text-slate-600">
          Signed in as <span className="font-medium">{authUser.name || authUser.full_name || authUser.email}</span>
          {" "}
          {(() => {
            const t = authUser.team_name || authUser.teamName || (authUser.team && (authUser.team.name || authUser.team.team_name)) || authUser.team || authUser.group || authUser.team_id || authUser.teamId;
            return t ? (<span>• Team: <span className="font-medium">{t}</span></span>) : null;
          })()}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Problem</label>
            {loadingProblems ? (
              <div className="text-sm text-slate-500 mt-1">Loading problems…</div>
            ) : problemsError ? (
              <div className="text-sm text-rose-600 mt-1">{problemsError}</div>
            ) : (
              <ProblemPicker
                problems={problems}
                value={problemId}
                onChange={(v) => setProblemId(v)}
                onRefresh={loadProblems}
              />
            )}
          </div>

          {/* Only show problem title and id for quick registration */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Selected Problem</label>
            <div className="mt-1 p-3 border rounded-md bg-slate-50">
                <div className="text-sm font-medium">{selectedProblem ? formatTitleField(selectedProblem.title ?? selectedProblem.name ?? selectedProblem.problemStatement ?? selectedProblem.problem ?? selectedProblem) : '—'}</div>
              <div className="text-xs text-slate-500 mt-1">ID: {problemId}</div>
            </div>
          </div>

          {message && (
            <div className={`text-sm ${message.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>{message.text}</div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Register</button>
            {/* Reset button removed */}
          </div>
        </div>
      </form>

  <div className="text-sm text-slate-500">Note: This form posts to <code>/case-study-registrations</code>. If your backend uses a different endpoint, tell me and I will update it.</div>
    </div>
  );
}
