"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";

// Professional event demo page
const demoEvent = {
  title: "Design Mania",
  subtitle: "Competition",
  banner: "eventBanner.png",
  logo: "eventLogo.png",
  about:
    "Design Mania 2024 presented by Codigo Plataforma is an individual UI/UX design competition where participants will demonstrate their research, creativity, and design skills. Participants will receive a case study, and they will have 24 hours to conduct research. Once research is submitted, participants will then design according to the case study.",
  importantDate: "2025-11-13",
  organiserContact: "Codigo Plataforma\nEmail: siliconcodingclub@gmail.com\nPhone: +91 6370 577 859",
  location: "Seminar Hall and Lab 3 & 4",
    stages: [
    { id: 1, title: "Registration", start: "Nov 8", end: "Nov 11", time: "All day", description: "Open registrations for teams containing 3 members." },
    { id: 2, title: "Case Study Release", start: "Nov 12", end: "Nov 13", time: "12:00 AM (Release)", description: "Participants will receive the case study and have 24 hours to conduct research and submit their Research." },
    { id: 3, title: "Finals & Demos", start: "Nov 13", end: "Nov 13", time: "9:00 AM - 4:30 PM", description: "Final presentations, demos and judging taking place on-site." },
  ],
  prizes: [
    { id: 1, title: "1st Prize", amount: "1,500", description: "Grand prize for the winning team." },
    { id: 2, title: "2nd Prize", amount: "1,000", description: "Runner-up prize." },
    { id: 3, title: "Best UX", amount: "500", description: "Award for the best user experience." },
  ],
};

export default function Page() {
  const router = useRouter();
  // Start with server-consistent placeholder and hydrate on mount to avoid hydration mismatch
  const [regCount, setRegCount] = useState(0);

  // defer reading event assets until client mount to avoid SSR/client mismatch
  const [teamSize, setTeamSize] = useState(null);

  // hydrate regCount and teamSize from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("registrations");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRegCount(parsed.length);
        }
        const rawAssets = localStorage.getItem("eventAssets");
        if (rawAssets) {
          try {
            const parsedAssets = JSON.parse(rawAssets);
            setTeamSize(parsedAssets?.teamSize ?? null);
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Modal state for showing rules before registration
  const [showRules, setShowRules] = useState(false);
  const [pendingReg, setPendingReg] = useState({ name: "", email: "" });
  // start with server-consistent initial value and hydrate on mount
  const [authUser, setAuthUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false); // case-study registration
  const [alreadyEventRegistered, setAlreadyEventRegistered] = useState(false); // event/team registration
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [debugLastSaved, setDebugLastSaved] = useState(null);

  // respond to auth changes dispatched elsewhere in the app
  useEffect(() => {
    function onAuthChange() {
      try {
        const raw = localStorage.getItem("authUser");
        setAuthUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setAuthUser(null);
      }
    }
    window.addEventListener("authChange", onAuthChange);
    // also listen to storage events from other tabs
    function onStorage(e) {
      if (e.key === "authUser") onAuthChange();
    }
    window.addEventListener("storage", onStorage);
    // initialize authUser on client mount to avoid SSR/client markup mismatch
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      const parsed = raw ? JSON.parse(raw) : null;
      setAuthUser(parsed);
      // quick local check: if we have a local lastSavedTeam that includes this user, mark as registered
      try {
        const rawLast = typeof window !== "undefined" ? localStorage.getItem("lastSavedTeam") : null;
        if (rawLast && parsed) {
          const last = JSON.parse(rawLast);
          // gather candidate identifiers from lastSavedTeam (members array, server.members, server.leader etc.)
          const ids = new Set();
          function pushId(v) {
            if (v == null) return;
            try {
              if (typeof v === 'string' || typeof v === 'number') ids.add(String(v));
              else if (typeof v === 'object') {
                const cand = v.sic || v.sic_no || v.id || v.email || v.email_address || v.name || v.full_name;
                if (cand) ids.add(String(cand));
              }
            } catch (e) {}
          }
          const m1 = Array.isArray(last?.members) ? last.members : [];
          m1.forEach(pushId);
          const m2 = Array.isArray(last?.server?.members) ? last.server.members : [];
          m2.forEach(pushId);
          // possible leader or owner fields
          pushId(last?.server?.leader || last?.server?.team_leader || last?.server?.owner);
          // also push any raw values from server
          if (last?.server && typeof last.server === 'object') {
            Object.values(last.server).forEach(pushId);
          }
          const sic = parsed.sic || parsed.sic_no || parsed.sicNo || parsed.id || parsed.email || parsed.email_address;
          let matches = false;
          if (sic) {
            matches = Array.from(ids).some((x) => x && (x === String(sic) || x === String(parsed.id) || x === String(parsed.email)));
          }
          // if no strict match found but lastSavedTeam has a team_name and we have an authUser, treat as match (fallback)
          if (!matches && last?.team_name && parsed) matches = true;
          if (matches) setAlreadyEventRegistered(true);
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      setAuthUser(null);
    }
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // When authUser changes, try to lookup their team by SIC number and check registration
  useEffect(() => {
    let mounted = true;
    async function loadTeamForUser(u) {
      if (!u) {
        if (mounted) {
          setTeamInfo(null);
          setAlreadyRegistered(false);
        }
        return;
      }
      const sic = u.sic || u.sic_no || u.sicNo || u.SIC || u.sicNumber || u.sic_number || u.id;
      if (!sic) {
        if (mounted) {
          setTeamInfo(null);
          setAlreadyRegistered(false);
        }
        return;
      }
      
      // First verify the user exists on the server
      try {
        const userId = u.id || u._id || u.userId;
        if (userId) {
          const userCheck = await get(`/users/${encodeURIComponent(String(userId))}`);
          if (!userCheck || userCheck.error || !userCheck.data) {
            // User doesn't exist on server, auto logout
            console.warn('User not found on server, logging out...');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authUser');
              localStorage.removeItem('authToken');
              window.dispatchEvent(new Event('authChange'));
              window.location.href = '/login';
            }
            return;
          }
        }
      } catch (err) {
        // If 401 or 404, user doesn't exist or token is invalid
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          console.warn('User authentication failed, logging out...');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authUser');
            localStorage.removeItem('authToken');
            window.dispatchEvent(new Event('authChange'));
            window.location.href = '/login';
          }
          return;
        }
        // For other errors, continue (might be network issue)
        console.warn('Failed to verify user:', err);
      }
      
      try {
        const res = await get(`/teams/member/${encodeURIComponent(String(sic))}`);
  const data = res?.data || res;
  const team = Array.isArray(data) ? data[0] : (data?.team || data?.teams?.[0] || data);
        if (mounted) {
          setTeamInfo(team || null);
          // If a team object exists, treat the user as already registered for the event
          const hasTeam = Boolean(
            team && (team.id || team._id || team.team_id || team.teamId || (Array.isArray(team.members) && team.members.length > 0))
          );
          setAlreadyEventRegistered(hasTeam);
          // Separately track whether the team is registered for the case-study (existing logic)
          const registeredForCaseStudy = Boolean(
            team && (team.problem_id || team.problemId || team.problem || team.problemStatement || team.registered || team.registered_for_case_study)
          );
          setAlreadyRegistered(registeredForCaseStudy);
          // detect leader: check common leader fields or member roles
          try {
            // Build set of auth identifiers for the current user
            const authIds = new Set();
            const addAuth = (v) => { if (v != null) authIds.add(String(v)); };
            addAuth(u?.sic); addAuth(u?.sic_no); addAuth(u?.sicNo); addAuth(u?.id); addAuth(u?.email); addAuth(u?.email_address);

            let leaderFound = false;

            const pushCandidate = (c) => { if (c != null) {
              try { if (Array.isArray(c)) c.forEach(x => pushCandidate(x)); else authIds.add(String(c)); } catch(e) {}
            } };

            // collect candidates from team object
            const leaderCandidates = [];
            if (team && typeof team === 'object') {
              const keys = [
                'leader','leader_id','leader_sic','leader_sic_no','team_leader','team_leader_id','owner','created_by','createdBy','captain','creator','createdBySic'
              ];
              for (const k of keys) {
                const v = team[k];
                if (v) leaderCandidates.push(v);
              }
              // also check nested leader object
              if (team.leader && typeof team.leader === 'object') {
                leaderCandidates.push(team.leader.id, team.leader.sic, team.leader.sic_no, team.leader.email);
              }
              // check members array for role flags and explicit leader flags
              const tMembers = Array.isArray(team.members) ? team.members : Array.isArray(team.users) ? team.users : [];
              for (const m of tMembers) {
                if (!m) continue;
                if (typeof m === 'string' || typeof m === 'number') leaderCandidates.push(m);
                else if (typeof m === 'object') {
                  leaderCandidates.push(m.sic, m.sic_no, m.id, m.email, m.email_address);
                  const role = (m.role || m.roleName || m.position || m.title || "").toString().toLowerCase();
                  if (role.includes('lead') || role.includes('captain') || role.includes('owner')) {
                    leaderCandidates.push(m.sic || m.sic_no || m.id || m.email);
                  }
                  if (m.is_leader || m.leader || m.isLeader || m.isCaptain) {
                    leaderCandidates.push(m.sic || m.sic_no || m.id || m.email);
                  }
                }
              }
            }

            // also pull leader info from any local lastSavedTeam server fallback
            try {
              const rawLast = typeof window !== 'undefined' ? localStorage.getItem('lastSavedTeam') : null;
              const last = rawLast ? JSON.parse(rawLast) : null;
              if (last && last.server) {
                const s = last.server;
                leaderCandidates.push(s.leader, s.leader_id, s.team_leader, s.team_leader_id, s.owner, s.created_by);
                if (s.leader && typeof s.leader === 'object') leaderCandidates.push(s.leader.id, s.leader.sic, s.leader.sic_no, s.leader.email);
              }
            } catch (e) {}

            // normalize candidates and check against authIds
            for (const cand of leaderCandidates) {
              if (!cand) continue;
              if (Array.isArray(cand)) {
                for (const c2 of cand) {
                  if (c2 != null && authIds.has(String(c2))) { leaderFound = true; break; }
                }
                if (leaderFound) break;
              } else {
                try {
                  if (authIds.has(String(cand))) { leaderFound = true; break; }
                } catch (e) {}
              }
            }

            // fallback: treat first member as leader if nothing explicit matched
            if (!leaderFound) {
              try {
                const tMembers = Array.isArray(team?.members) ? team.members : Array.isArray(team?.users) ? team.users : [];
                if (tMembers.length > 0) {
                  const first = tMembers[0];
                  let firstId = null;
                  if (first) {
                    if (typeof first === 'string' || typeof first === 'number') firstId = String(first);
                    else if (typeof first === 'object') firstId = String(first.sic || first.sic_no || first.id || first.email || first.email_address || first.name || first.full_name || "");
                  }
                  if (firstId && authIds.has(firstId)) leaderFound = true;
                }
              } catch (e) { /* ignore */ }
            }

            setIsTeamLeader(Boolean(leaderFound));
          } catch (e) {
            setIsTeamLeader(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setTeamInfo(null);
          setAlreadyRegistered(false);
          setAlreadyEventRegistered(false);
        }
        console.warn("Failed to load team for user SIC:", err);
      }
    }
    loadTeamForUser(authUser);
    return () => { mounted = false; };
  }, [authUser]);

  // Also check local lastSavedTeam on mount (independent of authUser) so users who just created
  // a team locally are immediately considered registered.
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const rawLast = localStorage.getItem('lastSavedTeam');
      if (!rawLast) return;
      const last = JSON.parse(rawLast);
      if (last && (Array.isArray(last.members) && last.members.length > 0 || last.team_name || last.server)) {
        // set flag but defer to next tick to avoid setState-in-effect warnings
        setTimeout(() => setAlreadyEventRegistered(true), 0);
        // if authUser is present and is included in lastSavedTeam members, assume leader (fallback)
        try {
          const rawAuth = localStorage.getItem('authUser');
          const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
          const authId = parsedAuth && (parsedAuth.sic || parsedAuth.sic_no || parsedAuth.id || parsedAuth.email);
          const members = Array.isArray(last.members) ? last.members : (Array.isArray(last.server?.members) ? last.server.members : []);
          if (authId && Array.isArray(members)) {
            const found = members.some((m) => String(m) === String(authId) || String(m) === String(parsedAuth?.id) || String(m) === String(parsedAuth?.email));
            if (found) setTimeout(() => setIsTeamLeader(true), 0);
          }
        } catch (e) { /* ignore */ }
      }
      // load debug lastSaved if debug enabled via URL
      try {
        const p = new URLSearchParams(window.location.search);
        if (p.get('debug') === '1') {
          setTimeout(() => {
            setDebugEnabled(true);
            try { setDebugLastSaved(rawLast ? JSON.parse(rawLast) : null); } catch (e) { setDebugLastSaved(null); }
          }, 0);
        }
      } catch (e) {}
    } catch (e) {
      // ignore
    }
  }, []);
  
  // If current local time is >= 15:50, allow showing Register button even when alreadyRegistered
  const [forceShowRegisterByTime, setForceShowRegisterByTime] = useState(false);
  useEffect(() => {
    let mounted = true;
    function checkTime() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      // 15:50 in 24-hour clock
      const should = (h > 15) || (h === 15 && m >= 50);
      if (mounted) setForceShowRegisterByTime(should);
    }
    checkTime();
    const t = setInterval(checkTime, 60 * 1000);
    return () => { mounted = false; clearInterval(t); };
  }, []);
  // Team modal state shown after registration
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  // members: array of { name, email }
  const defaultMembers = Array.from({ length: 3 }, () => ({ name: "", email: "" }));
  const [members, setMembers] = useState(defaultMembers);

  function handleSidebarRegister(nameOverride, emailOverride) {
    const name = (nameOverride || "").trim();
    const email = (emailOverride || "").trim();
    if (!name || !email) {
      console.warn("Registration data missing.");
      return;
    }

    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("registrations") : null;
      const arr = raw ? JSON.parse(raw) : [];
      const newReg = { id: `r${Date.now()}`, name, email };
      const next = [newReg, ...(Array.isArray(arr) ? arr : [])];
      localStorage.setItem("registrations", JSON.stringify(next));
  setRegCount(next.length);
  console.log("Registration saved (demo).");
    } catch (e) {
      console.error(e);
      console.error("Failed to register.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-800">
      {/* Hero */}
      <section className="relative">
        <div className="h-64 md:h-96 w-full bg-gray-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={demoEvent.banner} alt="Event banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 to-transparent" />
        </div>
        {/* logo/title card moved below the banner */}
      </section>

  <section className="container mx-auto px-4 mt-6 md:mt-10">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg shadow-lg p-4 md:p-6 flex items-center gap-4 md:gap-6">
          <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={demoEvent.logo} alt="Event logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg md:text-2xl font-bold">{demoEvent.title}</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">{demoEvent.subtitle}</p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">{demoEvent.importantDate}</div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">{demoEvent.location}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-8">
            <article className="bg-white border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold">About the event</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">{demoEvent.about}</p>
            </article>
            <article className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Eligibility</h3>
              <p className="mt-3 text-slate-700 leading-relaxed">
                This event is open to all the students of Silicon Institute of Technology, Sambalpur to showcase their UI/UX skills. Teams (up to maximum 3 members) are welcome.
                Participants must register before {demoEvent.importantDate} and agree to the
                event code of conduct.
              </p>
              <ul className="mt-4 list-disc list-inside text-slate-600 space-y-1">
                <li>Inter-branch teams are encouraged. </li>
                <li>Inter-batch teams are encouraged</li>
              </ul>
            </article>

            <article className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Timeline</h3>
              <div className="mt-4 space-y-4">
                {demoEvent.stages.map((s, idx) => (
                  <div key={s.id} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">{idx + 1}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{s.title}</div>
                        <div className="text-sm text-slate-500 text-right">
                          <div>{s.start} — {s.end}</div>
                          {s.time && <div className="text-xs text-slate-400 mt-1">{s.time}</div>}
                        </div>
                      </div>
                      {s.description && <div className="mt-2 text-sm text-slate-600">{s.description}</div>}
                      {/* Link to view the Case Study details - only visible to team leader */}
                      {s.id === 2 && isTeamLeader && (
                        <div className="mt-3 flex items-center gap-3">
                          <a
                            href="/DesignMania-CaseStudy.pdf"
                            download
                            className="inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600 transition"
                          >
                            View Case Study
                          </a>
                          {/* Register for case study button: only visible when not already registered */}
                          {!alreadyRegistered && (
                            <button
                              type="button"
                              onClick={() => router.push('/event/case-study/register')}
                              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
                            >
                              Register for Case Study
                            </button>
                          )}
                        </div>
                      )}
                      {debugEnabled && (
                        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full p-3 bg-white border rounded shadow text-xs">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold text-sm">Event Debug</div>
                            <button onClick={() => {
                              try {
                                setDebugEnabled(false);
                                const p = new URLSearchParams(window.location.search);
                                p.delete('debug');
                                const ns = p.toString();
                                const url = window.location.pathname + (ns ? `?${ns}` : '');
                                window.history.replaceState(null, '', url);
                              } catch (e) {}
                            }} className="text-xs px-2 py-1 border rounded">Close</button>
                          </div>
                          <pre className="whitespace-pre-wrap max-h-64 overflow-auto">{JSON.stringify({ authUser, teamInfo, isTeamLeader, alreadyRegistered, alreadyEventRegistered, forceShowRegisterByTime, lastSavedTeam: debugLastSaved }, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Rewards & Prizes</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {demoEvent.prizes.map((p, i) => (
                  <div key={p.id} className={`border rounded-lg p-4 ${i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                    <div className="flex items-baseline justify-between">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-slate-600">{p.amount}</div>
                    </div>
                    {p.description && <div className="mt-2 text-sm text-slate-600">{p.description}</div>}
                  </div>
                ))}
              </div>
            </article>
          </main>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-4">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-slate-700">
                      <div className="font-medium">{authUser?.name ?? "Demo User"}</div>
                      <div className="text-xs text-slate-500">{authUser?.email ?? "demo.user@example.com"}</div>
                    </div>
                    <div className="mt-3">
                      { alreadyEventRegistered ? (
                          <div className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-md text-center">Already registered</div>
                        ) : (
                          <button
                            onClick={() => {
                              setPendingReg({ name: authUser?.name ?? "Demo User", email: authUser?.email ?? "demo.user@example.com" });
                              setShowRules(true);
                            }}
                            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md"
                          >
                            Register
                          </button>
                        )}
                      </div>
                      <div className="mt-3 text-sm text-slate-700">
                        <div>Total registered: <span className="font-semibold">{regCount}</span></div>
                        <div>Team size: <span className="font-semibold">{teamSize ? `${teamSize}` : '3'}</span></div>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <div className="text-xs">
                            <div>Team Leader: <span className={`font-semibold ${isTeamLeader ? 'text-green-600' : 'text-slate-500'}`}>{isTeamLeader ? 'Yes' : 'No'}</span></div>
                            <div>Case Study Registered: <span className={`font-semibold ${alreadyRegistered ? 'text-blue-600' : 'text-slate-500'}`}>{alreadyRegistered ? 'Yes' : 'No'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                {/* Case study quick actions: only visible to team leader */}
                {isTeamLeader && (
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-slate-500">Case Study</div>
                    <div className="mt-3 flex items-center gap-3">
                      <a
                        href="/DesignMania-CaseStudy.pdf"
                        download
                        className="inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600 transition"
                      >
                        View Case Study
                      </a>
                      {!alreadyRegistered && (
                        <button
                          type="button"
                          onClick={() => router.push('/event/case-study/register')}
                          className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
                        >
                          Register for Case Study
                        </button>
                      )}
                    </div>
                  </div>
                )}

              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-slate-500">Contact the organisers</div>
                <pre className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{demoEvent.organiserContact}</pre>
              </div>

              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-medium">Venue</h4>
                <div className="mt-2 text-sm text-slate-700">{demoEvent.location}</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {/* Rules modal shown before registering */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRules(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-xl w-full mx-4 p-6">
            <h3 className="text-lg font-semibold">Event Rules &amp; Guidelines</h3>
      
            <div className="mt-3 text-sm text-slate-700 space-y-2">
  <p>• Each team may have up to 3 members.</p>
  <p>• Participants must submit research within 24 hours of the case study release.</p>
  <p>• Follow the code of conduct and respect intellectual property rules.</p>
  <p>• Late submissions will not be considered.</p>
  <p>• All designs must be original. Plagiarism or copying from existing designs will lead to disqualification.</p>
  <p>• Participants are allowed to use any design tool of their choice (Figma, Adobe XD, Sketch, etc.).</p>
  <p>• The final submission must include both the design screens and a short justification of the design decisions.</p>
  <p>• The judging criteria will include creativity, usability, clarity, and adherence to the given problem statement.</p>
  <p>• The decision of the judging panel will be final and binding.</p>
  <p>• Participants must maintain professionalism and respectful communication throughout the competition.</p>
  <p>• Any form of misconduct, unfair advantage, or use of AI-generated full UI without adaptation may result in penalties.</p>
  <p>• Ensure your designs are responsive and consider multiple screen sizes where applicable.</p>
  <p>• After you agree with the terms and conditions you cannot back-out from the competition.</p>
</div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowRules(false)} className="px-3 py-2 rounded-md border">Cancel</button>
              <button
                onClick={() => {
                  // persist pending registration so the register page can use it if needed
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("pendingRegistration", JSON.stringify(pendingReg));
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  setShowRules(false);
                  // navigate to registration page
                  try { router.push("/event/register"); } catch (e) { console.error(e); }
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md"
              >
                I Agree &amp; Register
              </button>
            </div>
          </div>
        </div>
      )}
      
    </main>
  );
}
