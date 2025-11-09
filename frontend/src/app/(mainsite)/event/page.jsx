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
    "Design Mania 2025 presented by Codigo Plataforma is a team (consisting of 3 members) UI/UX design competition where participants will demonstrate their research, creativity, and design skills. Participants will receive a case study, and they will have 24 hours to conduct research. Once research is submitted, participants will then design according to the case study.",
  importantDate: "2025-11-13",
  organiserContact:
    "Codigo Plataforma\nEmail: siliconcodingclub@gmail.com\nPhone: +91 6370 577 859",
  location: "Seminar Hall and Lab 3 & 4",
  stages: [
    {
      id: 1,
      title: "Registration",
      start: "Nov 8",
      end: "Nov 10",
      time: "All day",
      description: "Open registrations for teams containing 3 members.",
    },
    {
      id: 2,
      title: "Case Study Release",
      start: "Nov 11",
      end: "Nov 12",
      time: "10:00 PM (Release)",
      description:
        "Participants will receive the case study and have 24 hours to conduct research and submit their Research.",
    },
    {
      id: 3,
      title: "Finals & Demos",
      start: "Nov 13",
      end: "Nov 13",
      time: "9:00 AM - 4:30 PM",
      description:
        "Final presentations, demos and judging taking place on-site.",
    },
    {
      id: 4,
      title: "Winner Announcement",
      start: "Nov 14",
      end: "Nov 14",
      time: "12:00 PM",
      description:
        "Winners will be announced.",
    },
  ],
  prizes: [
    {
      id: 1,
      title: "1st Prize",
      amount: "1,500",
      description: "Grand prize for the winning team.",
    },
    {
      id: 2,
      title: "2nd Prize",
      amount: "1,000",
      description: "Runner-up prize.",
    },
    {
      id: 3,
      title: "3rd Prize",
      amount: "500",
      description: "Award for the third-place team.",
    },
  ],
};

export default function Page() {
  const router = useRouter();

  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("authUser");

      if (!token || !user) {
        // Not authenticated, redirect to login
        router.replace("/login");
        return;
      }

      // Use setTimeout to avoid setState-in-effect warnings
      setTimeout(() => {
        setIsAuthenticated(true);
        setCheckingAuth(false);
      }, 0);
    }
  }, [router]);
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

  // Helper: fetch team details for a given SIC from the server (defensive utility)
  async function fetchTeamBySIC(sic) {
    if (!sic) return null;
    try {
      const res = await get(`/teams/member/${encodeURIComponent(String(sic))}`);
      // API returns team object directly: { id, team_name, problemStatement, members: [...] }
      const team = res?.data || res;
      console.log('fetchTeamBySIC result:', team);
      return team || null;
    } catch (err) {
      console.warn('fetchTeamBySIC failed:', err);
      return null;
    }
  }

  // Case study unlock time from environment variable
  const [isCaseStudyUnlocked, setIsCaseStudyUnlocked] = useState(false);

  // Check if current time is past the unlock time
  useEffect(() => {
    const unlockTimeStr = process.env.NEXT_PUBLIC_CASE_STUDY_UNLOCK_TIME;
    const unlockTime = new Date(unlockTimeStr).getTime();
    const checkUnlockStatus = () => {
      const now = new Date().getTime();
      setIsCaseStudyUnlocked(now >= unlockTime);
    };

    checkUnlockStatus();
    // Check every minute in case page is left open
    const interval = setInterval(checkUnlockStatus, 60000);
    return () => clearInterval(interval);
  }, []);

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
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      const parsed = raw ? JSON.parse(raw) : null;
      setAuthUser(parsed);
      // quick local check: if we have a local lastSavedTeam that includes this user, mark as registered
      try {
        const rawLast =
          typeof window !== "undefined"
            ? localStorage.getItem("lastSavedTeam")
            : null;
        if (rawLast && parsed) {
          const last = JSON.parse(rawLast);
          // gather candidate identifiers from lastSavedTeam (members array, server.members, server.leader etc.)
          const ids = new Set();
          function pushId(v) {
            if (v == null) return;
            try {
              if (typeof v === "string" || typeof v === "number")
                ids.add(String(v));
              else if (typeof v === "object") {
                const cand =
                  v.sic ||
                  v.sic_no ||
                  v.id ||
                  v.email ||
                  v.email_address ||
                  v.name ||
                  v.full_name;
                if (cand) ids.add(String(cand));
              }
            } catch (e) {}
          }
          const m1 = Array.isArray(last?.members) ? last.members : [];
          m1.forEach(pushId);
          const m2 = Array.isArray(last?.server?.members)
            ? last.server.members
            : [];
          m2.forEach(pushId);
          // possible leader or owner fields
          pushId(
            last?.server?.leader ||
              last?.server?.team_leader ||
              last?.server?.owner
          );
          // also push any raw values from server
          if (last?.server && typeof last.server === "object") {
            Object.values(last.server).forEach(pushId);
          }
          const sic =
            parsed.sic ||
            parsed.sic_no ||
            parsed.sicNo ||
            parsed.id ||
            parsed.email ||
            parsed.email_address;
          let matches = false;
          if (sic) {
            matches = Array.from(ids).some(
              (x) =>
                x &&
                (x === String(sic) ||
                  x === String(parsed.id) ||
                  x === String(parsed.email))
            );
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

  // On mount: defensive check using localStorage authUser to fetch team and set UI flags
  useEffect(() => {
    (async () => {
      try {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem("authUser");
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed) return;
        const sic = parsed.sic || parsed.sic_no || parsed.sicNo || parsed.id || parsed.email;
        if (!sic) return;
        const team = await fetchTeamBySIC(sic);
        if (!team) return;
        setTeamInfo(team || null);
        const hasTeam = Boolean(
          team && (team.id || team._id || team.team_id || team.teamId || (Array.isArray(team.members) && team.members.length > 0))
        );
        setAlreadyEventRegistered(hasTeam);
        const registeredForCaseStudy = Boolean(
          team && (team.problem_id || team.problemId || team.problem || team.problemStatement || team.registered || team.registered_for_case_study)
        );
        setAlreadyRegistered(registeredForCaseStudy);

        // Leader detection: check if current user has role "LEADER" in members array
        try {
          const userIds = new Set();
          if (parsed?.id) userIds.add(String(parsed.id));
          if (parsed?.sic) userIds.add(String(parsed.sic));
          if (parsed?.sic_no) userIds.add(String(parsed.sic_no));
          if (parsed?.email) userIds.add(String(parsed.email));

          let leaderFound = false;
          
          // Check members array for LEADER role
          if (Array.isArray(team.members)) {
            const leaderMember = team.members.find(m => m.role === 'LEADER');
            if (leaderMember) {
              const leaderSic = leaderMember.sic_no || leaderMember.sic || leaderMember.id;
              if (leaderSic && userIds.has(String(leaderSic))) {
                leaderFound = true;
              }
            }
          }

          setIsTeamLeader(Boolean(leaderFound));
          console.log('[Leader Check] Mount check:', { userIds: Array.from(userIds), isLeader: leaderFound });
        } catch (e) {
          console.warn('Leader detect failed:', e);
          setIsTeamLeader(false);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // When authUser changes, try to lookup their team by SIC number and check registration
  useEffect(() => {
    console.log(alreadyEventRegistered, 'alreadyEventRegistered');
    let mounted = true;
    async function loadTeamForUser(u) {
      if (!u) {
        if (mounted) {
          setTeamInfo(null);
          setAlreadyRegistered(false);
        }
        return;
      }
      const sic =
        u.sic ||
        u.sic_no ||
        u.sicNo ||
        u.SIC ||
        u.sicNumber ||
        u.sic_number ||
        u.id;
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
          const userCheck = await get(
            `/users/${encodeURIComponent(String(userId))}`
          );
          if (!userCheck || userCheck.error || !userCheck.data) {
            // User doesn't exist on server, auto logout
            console.warn("User not found on server, logging out...");
            if (typeof window !== "undefined") {
              localStorage.removeItem("authUser");
              localStorage.removeItem("authToken");
              window.dispatchEvent(new Event("authChange"));
              window.location.href = "/login";
            }
            return;
          }
        }
      } catch (err) {
        // If 401 or 404, user doesn't exist or token is invalid
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          console.warn("User authentication failed, logging out...");
          if (typeof window !== "undefined") {
            localStorage.removeItem("authUser");
            localStorage.removeItem("authToken");
            window.dispatchEvent(new Event("authChange"));
            window.location.href = "/login";
          }
          return;
        }
        // For other errors, continue (might be network issue)
        console.warn("Failed to verify user:", err);
      }

      try {
        const res = await get(
          `/teams/member/${encodeURIComponent(String(sic))}`
        );
        // API returns team object directly: { id, team_name, problemStatement, members: [...] }
        const team = res?.data || res;
        console.log('[Auth Effect] Team fetched for user:', team);
        if (mounted) {
          setTeamInfo(team || null);
          // If a team object exists, treat the user as already registered for the event
          const hasTeam = Boolean(
            team &&
              (team.id || (Array.isArray(team.members) && team.members.length > 0))
          );
          console.log('[Auth Effect] hasTeam check:', hasTeam);
          setAlreadyEventRegistered(hasTeam);
          // Separately track whether the team is registered for the case-study (existing logic)
          const registeredForCaseStudy = Boolean(
            team &&
              (team.problem_id ||
                team.problemId ||
                team.problem ||
                team.problemStatement ||
                team.registered ||
                team.registered_for_case_study)
          );
          setAlreadyRegistered(registeredForCaseStudy);

          // Check if current user is the team leader
          try {
            let leaderFound = false;

            // First, check localStorage for team leader info (set during registration)
            try {
              const rawLast =
                typeof window !== "undefined"
                  ? localStorage.getItem("lastSavedTeam")
                  : null;
              if (rawLast) {
                const last = JSON.parse(rawLast);
                // If lastSavedTeam has isLeader flag, use it
                if (last.isLeader === true) {
                  leaderFound = true;
                  console.log(
                    "[Leader Check] Found from localStorage: isLeader = true"
                  );
                }
              }
            } catch (e) {
              console.warn("[Leader Check] Error reading localStorage:", e);
            }

            // If not found in localStorage, check API response members array
            if (!leaderFound && team && Array.isArray(team.members)) {
              const userIds = new Set();
              if (u?.id) userIds.add(String(u.id));
              if (u?.sic) userIds.add(String(u.sic));
              if (u?.sic_no) userIds.add(String(u.sic_no));
              if (u?.sicNo) userIds.add(String(u.sicNo));
              if (u?.email) userIds.add(String(u.email));

              // Find member with LEADER role
              const leaderMember = team.members.find(m => m.role === 'LEADER');
              if (leaderMember) {
                const leaderSic = leaderMember.sic_no || leaderMember.sic || leaderMember.id;
                if (leaderSic && userIds.has(String(leaderSic))) {
                  leaderFound = true;
                }
              }

              console.log("[Leader Check] API check:", {
                userIds: Array.from(userIds),
                leaderMember: leaderMember?.sic_no,
                isLeader: leaderFound,
              });
            }

            setIsTeamLeader(Boolean(leaderFound));
          } catch (e) {
            console.error("[Leader Check Error]", e);
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
    return () => {
      mounted = false;
    };
  }, [authUser]);

  // Also check local lastSavedTeam on mount (independent of authUser) so users who just created
  // a team locally are immediately considered registered.
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const rawLast = localStorage.getItem("lastSavedTeam");
      if (!rawLast) return;
      const last = JSON.parse(rawLast);
      if (
        last &&
        ((Array.isArray(last.members) && last.members.length > 0) ||
          last.team_name ||
          last.server)
      ) {
        // set flag but defer to next tick to avoid setState-in-effect warnings
        setTimeout(() => setAlreadyEventRegistered(true), 0);
        // if authUser is present and is included in lastSavedTeam members, assume leader (fallback)
        try {
          const rawAuth = localStorage.getItem("authUser");
          const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
          const authId =
            parsedAuth &&
            (parsedAuth.sic ||
              parsedAuth.sic_no ||
              parsedAuth.id ||
              parsedAuth.email);
          const members = Array.isArray(last.members)
            ? last.members
            : Array.isArray(last.server?.members)
            ? last.server.members
            : [];
          if (authId && Array.isArray(members)) {
            const found = members.some(
              (m) =>
                String(m) === String(authId) ||
                String(m) === String(parsedAuth?.id) ||
                String(m) === String(parsedAuth?.email)
            );
            if (found) setTimeout(() => setIsTeamLeader(true), 0);
          }
        } catch (e) {
          /* ignore */
        }
      }
      // load debug lastSaved if debug enabled via URL
      try {
        const p = new URLSearchParams(window.location.search);
        if (p.get("debug") === "1") {
          setTimeout(() => {
            setDebugEnabled(true);
            try {
              setDebugLastSaved(rawLast ? JSON.parse(rawLast) : null);
            } catch (e) {
              setDebugLastSaved(null);
            }
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
      const should = h > 15 || (h === 15 && m >= 50);
      if (mounted) setForceShowRegisterByTime(should);
    }
    checkTime();
    const t = setInterval(checkTime, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // Check if registration is closed (time from env variable)
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(false);
  useEffect(() => {
    let mounted = true;
    function checkRegistrationTime() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      // Get registration close time from env (default: 22:35)
      const closeTime =
        process.env.NEXT_PUBLIC_REGISTRATION_CLOSE_TIME || "22:35";
      const [closeHour, closeMinute] = closeTime.split(":").map(Number);

      // Check if current time is past the closing time
      const isClosed = h > closeHour || (h === closeHour && m >= closeMinute);
      if (mounted) setIsRegistrationClosed(isClosed);
    }
    checkRegistrationTime();
    const t = setInterval(checkRegistrationTime, 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);
  // Team modal state shown after registration
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  // members: array of { name, email }
  const defaultMembers = Array.from({ length: 3 }, () => ({
    name: "",
    email: "",
  }));
  const [members, setMembers] = useState(defaultMembers);

  function handleSidebarRegister(nameOverride, emailOverride) {
    const name = (nameOverride || "").trim();
    const email = (emailOverride || "").trim();
    if (!name || !email) {
      console.warn("Registration data missing.");
      return;
    }

    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("registrations")
          : null;
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

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">
            Loading event...
          </p>
        </div>
      </main>
    );
  }

  // Don't render the page if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-800">
      {/* Hero */}
      <section className="relative">
        <div className="h-48 sm:h-64 md:h-96 w-full bg-gray-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={demoEvent.banner}
            alt="Event banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/30 to-transparent" />
        </div>
        {/* logo/title card moved below the banner */}
      </section>

      <section className="container mx-auto px-3 sm:px-4 mt-4 sm:mt-6 md:mt-10">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg shadow-lg p-3 sm:p-4 md:p-6 flex items-center gap-3 sm:gap-4 md:gap-6">
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={demoEvent.logo}
              alt="Event logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-2xl font-bold wrap-break-word">
              {demoEvent.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1 wrap-break-word">
              {demoEvent.subtitle}
            </p>
            <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-slate-100 text-xs sm:text-sm text-slate-700">
                {demoEvent.importantDate}
              </div>
              <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-slate-100 text-xs sm:text-sm text-slate-700 wrap-break-word">
                {demoEvent.location}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <main className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
            <article className="bg-white border rounded-lg p-4 sm:p-5 md:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold">
                About the event
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                {demoEvent.about}
              </p>
            </article>
            <article className="bg-white border rounded-lg p-4 sm:p-5 md:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold">
                Eligibility
              </h3>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                This event is open to all the students of Silicon Institute of
                Technology, Sambalpur to showcase their UI/UX skills. Teams (up
                to maximum 3 members) are welcome. Participants must register
                before {demoEvent.importantDate} and agree to the event code of
                conduct.
              </p>
              <ul className="mt-3 sm:mt-4 list-disc list-inside text-sm sm:text-base text-slate-600 space-y-1">
                <li>Inter-branch teams are encouraged. </li>
                <li>Inter-batch teams are encouraged</li>
              </ul>
            </article>

            <article className="bg-white border rounded-lg p-4 sm:p-5 md:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold">Timeline</h3>
              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                {demoEvent.stages.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
                  >
                    <div className="shrink-0 mt-0 sm:mt-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm sm:text-base">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="font-medium text-sm sm:text-base">
                          {s.title}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-500">
                          <div className="whitespace-nowrap">
                            {s.start} — {s.end}
                          </div>
                          {s.time && (
                            <div className="text-[10px] sm:text-xs text-slate-400 mt-1">
                              {s.time}
                            </div>
                          )}
                        </div>
                      </div>
                      {s.description && (
                        <div className="mt-2 text-xs sm:text-sm text-slate-600">
                          {s.description}
                        </div>
                      )}
                      {/* Link to view the Case Study details - only visible to team leader */}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="bg-white border rounded-lg p-4 sm:p-5 md:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold">
                Rewards & Prizes
              </h3>
              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {demoEvent.prizes.map((p, i) => (
                  <div
                    key={p.id}
                    className={`border rounded-lg p-3 sm:p-4 ${
                      i === 0 ? "bg-amber-50 border-amber-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-medium text-sm sm:text-base">
                        {p.title}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                        {p.amount}
                      </div>
                    </div>
                    {p.description && (
                      <div className="mt-2 text-xs sm:text-sm text-slate-600">
                        {p.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </main>

          <aside className="space-y-4 sm:space-y-6">
            <div className="lg:sticky lg:top-24 space-y-3 sm:space-y-4">
              <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="text-xs sm:text-sm text-slate-700">
                  <div className="font-medium text-sm sm:text-base">
                    {authUser?.name ?? "Demo User"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 wrap-break-word">
                    {authUser?.email ?? "demo.user@example.com"}
                  </div>
                </div>
                <div className="mt-3">
                  {isRegistrationClosed ? (
                    <div className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-md text-center text-xs sm:text-sm font-medium">
                      Registration Closed
                    </div>
                  ) : (alreadyEventRegistered || Boolean(teamInfo)) ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="You have already registered for this event"
                      className="w-full px-3 py-2 bg-slate-100 text-slate-500 rounded-md text-sm sm:text-base cursor-not-allowed"
                    >
                      Already registered
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Check authentication before showing rules
                        const token =
                          typeof window !== "undefined"
                            ? localStorage.getItem("authToken")
                            : null;
                        if (!token) {
                          router.push("/login");
                          return;
                        }
                        setShowRules(true);
                      }}
                      className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md text-sm sm:text-base hover:bg-indigo-700 transition"
                    >
                      Register
                    </button>
                  )}
                </div>
                <div className="mt-3 text-xs sm:text-sm text-slate-700 space-y-1">
                  <div>
                    Team size:{" "}
                    <span className="font-semibold">
                      {teamSize ? `${teamSize}` : "3"}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Group - Always visible to registered members */}
              {(alreadyEventRegistered || Boolean(teamInfo)) && (
                <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                  <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                    Important Links
                  </h4>
                  <div className="flex flex-col gap-2">
                    <a
                      href={
                        process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
                        "https://chat.whatsapp.com/your-group-link"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md text-xs sm:text-sm hover:bg-green-700 transition"
                    >
                      Join WhatsApp Group
                    </a>
                  </div>
                </div>
              )}

              {/* Case Study Links - Only visible after unlock time */}
              {(alreadyEventRegistered || Boolean(teamInfo)) && isCaseStudyUnlocked && (
                <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                  <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                    Case Study
                  </h4>
                  <div className="flex flex-col gap-2">
                    {/* View Case Study button - visible to all registered members */}
                    <a
                      href={
                        process.env.NEXT_PUBLIC_CASE_STUDY_PDF ||
                        "/DesignMania-CaseStudy.pdf"
                      }
                      download
                      className="inline-flex items-center justify-center px-3 py-2 bg-amber-500 text-white rounded-md text-xs sm:text-sm hover:bg-amber-600 transition"
                    >
                      View Case Study
                    </a>
                    {/* Register and Upload buttons only visible to team leader */}
                    {isTeamLeader && (
                      <>
                        {!alreadyRegistered && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push("/event/case-study/register")
                            }
                            className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md text-xs sm:text-sm hover:bg-indigo-700 transition"
                          >
                            Register for Case Study
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            alert("Upload research functionality coming soon!")
                          }
                          className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md text-xs sm:text-sm hover:bg-blue-700 transition"
                        >
                          Upload Research
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="text-xs sm:text-sm text-slate-500">
                  Contact the organisers
                </div>
                <pre className="mt-2 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap wrap-break-word">
                  {demoEvent.organiserContact}
                </pre>
              </div>

              <div className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                <h4 className="text-xs sm:text-sm font-medium">Venue</h4>
                <div className="mt-2 text-xs sm:text-sm text-slate-700 wrap-break-word">
                  {demoEvent.location}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      {/* Rules modal shown before registering */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRules(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg max-w-xl w-full mx-auto p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold">
              Event Rules &amp; Guidelines
            </h3>

            <div className="mt-3 text-xs sm:text-sm text-slate-700 space-y-2">
              <p>• Each team may have up to 3 members.</p>
              <p>
                • Participants must submit research within 24 hours of the case
                study release.
              </p>
              <p>
                • Follow the code of conduct and respect intellectual property
                rules.
              </p>
              <p>• Late submissions will not be considered.</p>
              <p>
                • All designs must be original. Plagiarism or copying from
                existing designs will lead to disqualification.
              </p>
              <p>
                • Participants are allowed to use any design tool of their
                choice (Figma, Adobe XD, Sketch, etc.).
              </p>
              <p>
                • The final submission must include both the design screens and
                a short justification of the design decisions.
              </p>
              <p>
                • The judging criteria will include creativity, usability,
                clarity, and adherence to the given problem statement.
              </p>
              <p>
                • The decision of the judging panel will be final and binding.
              </p>
              <p>
                • Participants must maintain professionalism and respectful
                communication throughout the competition.
              </p>
              <p>
                • Any form of misconduct, unfair advantage, or use of
                AI-generated full UI without adaptation may result in penalties.
              </p>
              <p>
                • Ensure your designs are responsive and consider multiple
                screen sizes where applicable.
              </p>
              <p>
                • After you agree with the terms and conditions you cannot
                back-out from the competition.
              </p>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowRules(false)}
                className="w-full sm:w-auto px-3 py-2 rounded-md border text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // persist pending registration so the register page can use it if needed
                  try {
                    if (typeof window !== "undefined") {
                      localStorage.setItem(
                        "pendingRegistration",
                        JSON.stringify(pendingReg)
                      );
                    }
                  } catch (e) {
                    console.error(e);
                  }
                  setShowRules(false);
                  // navigate to registration page
                  try {
                    router.push("/event/register");
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full sm:w-auto px-3 py-2 bg-indigo-600 text-white rounded-md text-sm sm:text-base hover:bg-indigo-700 transition"
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
