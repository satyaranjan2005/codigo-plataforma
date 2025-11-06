"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
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
      
      setIsAuthenticated(true);
      setCheckingAuth(false);
    }
  }, [router]);

  // Simplified: start with an empty team name (no localStorage)
  const [teamName, setTeamName] = useState("");
  const [query, setQuery] = useState("");
  // Simplified: always start with an empty members array
  const [members, setMembers] = useState([]);

  // NOTE: leader detection is derived from the first selected member (ids from pendingRegistration
  // use the `u_` prefix). We avoid storing leaderId separately to reduce setState-in-effect issues.

  // Simplified: start with a small static list; real data will be loaded from the API
  const [allUsers, setAllUsers] = useState([
    { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
    { id: "u2", name: "Bob Smith", email: "bob@example.com" },
    { id: "u3", name: "Carlos Reyes", email: "carlos@example.com" },
    { id: "u4", name: "Dana Lee", email: "dana@example.com" },
    { id: "u5", name: "Eve Park", email: "eve@example.com" },
  ]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // search state (remote endpoint)
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);

  // fetch users from backend and exclude ADMIN / SUPERADMIN
  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const res = await api.get("/teams/eligible-members");
        if (!mounted) return;
        const data = res?.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
        // Build a set of leader identifiers to exclude (current auth user and any saved team leader)
        const leaderIds = new Set();
        try {
          const rawAuth = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
          const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
          if (parsedAuth) {
            const aid = parsedAuth.sic || parsedAuth.sic_no || parsedAuth.id || parsedAuth.email;
            if (aid) leaderIds.add(String(aid));
          }
        } catch (e) { /* ignore */ }
        try {
          const rawLast = typeof window !== 'undefined' ? localStorage.getItem('lastSavedTeam') : null;
          const last = rawLast ? JSON.parse(rawLast) : null;
          const leaderCandidate = last?.server?.leader || last?.server?.leader_id || last?.server?.team_leader || last?.server?.team_leader_id || last?.leader;
          if (leaderCandidate) leaderIds.add(String(leaderCandidate));
        } catch (e) { /* ignore */ }

        const mapped = list.map((u) => ({
          id: u.sic_no || u.id || u.email || `${Date.now()}_${Math.random()}`,
          name: u.name || u.full_name || "",
          email: u.email || "",
          role: (u.role || u.roleName || (u.role && u.role.name) || "").toString(),
        }));
        // exclude ADMIN / SUPERADMIN and any leader ids
        const filtered = mapped.filter((u) => {
          const r = (u.role || "").toString().toLowerCase();
          if (r === "admin" || r === "superadmin") return false;
          if (leaderIds.has(String(u.id)) || leaderIds.has(String(u.email))) return false;
          return true;
        });
        setAllUsers(filtered);
      } catch (err) {
        console.warn("Failed to load users:", err);
        if (mounted) setUsersError(err?.message || "Failed to load users");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    }
    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  // No localStorage usage in this component by design

  // State to track if user is already registered
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Block access if user is already registered for event (check local lastSavedTeam or backend)
  useEffect(() => {
    let mounted = true;
    async function checkAlreadyRegistered() {
      try {
        if (typeof window === "undefined") return;
        const rawAuth = localStorage.getItem("authUser");
        const auth = rawAuth ? JSON.parse(rawAuth) : null;
        const sic = auth && (auth.sic || auth.sic_no || auth.sicNo || auth.id || auth.email);
        
        // 1) Quick local check - this is instant
        try {
          const rawLast = localStorage.getItem("lastSavedTeam");
          if (rawLast && sic) {
            const last = JSON.parse(rawLast);
            // Check if this user is in the team (either as leader or member)
            const members = Array.isArray(last?.members) ? last.members : (Array.isArray(last?.server?.members) ? last.server.members : []);
            const isLeader = last?.isLeader === true || last?.leader === String(sic);
            const isMember = Array.isArray(members) && members.some((m) => String(m) === String(sic) || String(m) === String(auth.id) || String(m) === String(auth.email));
            
            if (isLeader || isMember) {
              if (mounted) {
                setAlreadyRegistered(true);
                setCheckingRegistration(false);
              }
              router.replace('/event');
              return;
            }
          }
        } catch (e) {
          // ignore
        }

        // 2) Backend check if localStorage doesn't show registration
        if (!sic) {
          if (mounted) setCheckingRegistration(false);
          return;
        }
        
        try {
          const res = await api.get(`/teams/member/${encodeURIComponent(String(sic))}`);
          const data = res?.data || res;
          const team = Array.isArray(data) ? data[0] : (data?.team || data?.teams?.[0] || data);
          
          if (team && mounted) {
            setAlreadyRegistered(true);
            setCheckingRegistration(false);
            router.replace('/event');
            return;
          }
        } catch (err) {
          // Allow page if backend lookup fails (network issue, etc.)
        }
        
        // User is not registered, allow access
        if (mounted) {
          setAlreadyRegistered(false);
          setCheckingRegistration(false);
        }
      } catch (e) {
        if (mounted) setCheckingRegistration(false);
      }
    }
    checkAlreadyRegistered();
    return () => { mounted = false; };
  }, [router]);

  // (no-op) leaderId previously synced here — leader is derived below instead of stored
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Note: pendingRegistration (if present) is applied during initial state setup above to avoid
  // calling setState synchronously inside an effect which can cause cascading renders.

  // when query is present we use the remote search results, otherwise show local allUsers
  const results = useMemo(() => {
    const q = (query || "").trim();
    if (!q) return allUsers;
    return searchResults;
  }, [allUsers, query, searchResults]);

  // debounced remote search: GET /users/search?name={name}
  useEffect(() => {
    let mounted = true;
    const q = (query || "").trim();
    // clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      // empty query -> clear remote results and don't call API
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return () => {
        mounted = false;
      };
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const res = await api.get(`/teams/eligible-members/search?name=${encodeURIComponent(q)}`);
        if (!mounted) return;
        const data = res?.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
        // Build leaderIds same as loadUsers
        const leaderIds = new Set();
        try {
          const rawAuth = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
          const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null;
          if (parsedAuth) {
            const aid = parsedAuth.sic || parsedAuth.sic_no || parsedAuth.id || parsedAuth.email;
            if (aid) leaderIds.add(String(aid));
          }
        } catch (e) {}
        try {
          const rawLast = typeof window !== 'undefined' ? localStorage.getItem('lastSavedTeam') : null;
          const last = rawLast ? JSON.parse(rawLast) : null;
          const leaderCandidate = last?.server?.leader || last?.server?.leader_id || last?.server?.team_leader || last?.server?.team_leader_id || last?.leader;
          if (leaderCandidate) leaderIds.add(String(leaderCandidate));
        } catch (e) {}

        const mapped = list.map((u) => ({
          id: u.sic_no || u.id || u.email || `${Date.now()}_${Math.random()}`,
          name: u.name || u.full_name || "",
          email: u.email || "",
          role: (u.role || u.roleName || (u.role && u.role.name) || "").toString(),
        }));
        // exclude ADMIN / SUPERADMIN and leader ids
        const filtered = mapped.filter((u) => {
          const r = (u.role || "").toString().toLowerCase();
          if (r === "admin" || r === "superadmin") return false;
          if (leaderIds.has(String(u.id)) || leaderIds.has(String(u.email))) return false;
          return true;
        });
        setSearchResults(filtered);
      } catch (err) {
        console.warn("Search failed:", err);
        if (mounted) setSearchError(err?.message || "Search failed");
      } finally {
        if (mounted) setSearchLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // leaderPresent: true when the first selected member looks like the pending registrant
  // members now stores only member identifiers (sic/id strings)
  const leaderPresent = Boolean(members && members.length > 0 && typeof members[0] === "string" && members[0].startsWith("u_"));
  // maximum members a user can add
  const MAX_MEMBERS = 2;

  function addMember(user) {
    if (!user) return;
    // store only the member identifier (prefer sic/id)
    const memberId = user.id;
    setMembers((prev) => {
      if (prev.includes(memberId)) return prev;
      if (prev.length >= MAX_MEMBERS) return prev;
      return [...prev, memberId];
    });
  }

  function removeMember(id) {
    setMembers((prev) => prev.filter((m) => m !== id));
  }

  async function handleSaveTeam(e) {
    e.preventDefault();
    const name = (teamName || "").trim();
    if (!name) {
      // non-blocking feedback via console; the UI could be improved to show inline errors
      console.warn("Please enter a team name.");
      setToastMsg("Please enter a team name.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    if (members.length !== 2) {
      console.warn("You must add exactly 2 members to your team.");
      setToastMsg("You must add exactly 2 members to your team.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      // Send team to backend and capture server response when available
      const resp = await api.post("/teams", { team_name: name, members });
      const serverData = resp?.data || resp;

      // Build lastSavedTeam object to persist locally for quick lookup on /event
      const membersInfo = members.map((m) => {
        const u = allUsers.find((x) => x.id === m) || results.find((x) => x.id === m);
        return u || { id: m };
      });
      
      // Get current user's info to mark as leader
      const authUser = (() => {
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      })();
      
      const leaderId = authUser?.id || authUser?.sic || authUser?.sic_no || authUser?.sicNo;
      
      const lastSavedTeam = {
        server: serverData,
        team_name: name,
        members: members.slice(),
        membersInfo,
        leader: leaderId, // Store the leader's ID
        isLeader: true, // Current user is creating the team, so they're the leader
        savedAt: new Date().toISOString(),
      };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("lastSavedTeam", JSON.stringify(lastSavedTeam));
        }
      } catch (e) {
        console.warn("Failed to persist lastSavedTeam to localStorage:", e);
      }

      // show success toast then redirect
      setToastMsg("Team saved successfully");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/event");
      }, 1200);
    } catch (e) {
      console.error(e, "Failed to save team via API");
      // Show an error toast and keep the user on the page
      setToastMsg("Failed to save team. Please try again.");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  }

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">Verifying authentication...</p>
        </div>
      </main>
    );
  }

  // Show loading state while checking registration
  if (checkingRegistration) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
        <div className="text-center">
          <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-600">Checking registration status...</p>
        </div>
      </main>
    );
  }

  // Show blocked state if already registered (shouldn't normally see this due to redirect)
  if (alreadyRegistered) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-green-100 mb-3 sm:mb-4">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">Already Registered</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
            You have already registered for this event. You cannot register again.
          </p>
          <button
            onClick={() => router.push('/event')}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            Go to Event Page
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-4 sm:p-5 md:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Event Registration</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">Create a team for the event: add a team name and select exactly 2 members.</p>
        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Team Requirements:</strong> You must add exactly 2 members to create a valid team.
          </p>
        </div>

        <form onSubmit={handleSaveTeam} className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700">Team Name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-1.5 sm:mt-2 block w-full border rounded-md px-3 py-2 text-sm sm:text-base"
              placeholder="Team Awesome"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700">
              Selected members ({members.length}/2)
            </label>
            <div className="mt-2 space-y-2">
              {members.length === 0 && <div className="text-xs sm:text-sm text-slate-500">No members yet. Add exactly 2 members.</div>}
              {members.map((mId) => {
                const user = allUsers.find((u) => u.id === mId) || results.find((u) => u.id === mId) || { id: mId, name: mId, email: "" };
                return (
                  <div key={mId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 border rounded-md px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base wrap-break-word">{user.name}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 wrap-break-word">{user.email}</div>
                    </div>
                    <div className="w-full sm:w-auto">
                      <button type="button" onClick={() => removeMember(mId)} className="w-full sm:w-auto px-3 py-1 border rounded-md text-xs sm:text-sm hover:bg-gray-50 transition">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700">Search users</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1.5 sm:mt-2 block w-full border rounded-md px-3 py-2 text-sm sm:text-base"
              placeholder="Search by name or email"
            />

            <div className="mt-3 grid grid-cols-1 gap-2">
              {results.length === 0 && <div className="text-xs sm:text-sm text-slate-500">No users found.</div>}
              {results.slice(0, 4).map((u) => (
                <div key={u.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 border rounded-md px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base wrap-break-word">{u.name}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 wrap-break-word">{u.email}</div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => addMember(u)}
                      className="w-full sm:w-auto px-3 py-1 bg-indigo-600 text-white rounded-md text-xs sm:text-sm disabled:opacity-50 hover:bg-indigo-700 transition"
                      disabled={members.includes(u.id) || members.length >= 2}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button type="button" onClick={() => router.push("/event")} className="w-full sm:w-auto px-4 py-2 border rounded-md text-sm sm:text-base hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md text-sm sm:text-base hover:bg-indigo-700 transition">Save Team</button>
          </div>
        </form>
        {/* Toast */}
        {showToast && (
          <div className="fixed right-3 sm:right-4 bottom-4 sm:bottom-6 z-50 left-3 sm:left-auto">
            <div className="rounded-md bg-emerald-600 text-white px-3 sm:px-4 py-2 shadow-md text-xs sm:text-sm">
              {toastMsg}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
