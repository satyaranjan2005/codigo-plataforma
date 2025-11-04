"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState(() => {
    try {
      if (typeof window === "undefined") return "";
      const rawPending = localStorage.getItem("pendingRegistration");
      if (rawPending) {
        const p = JSON.parse(rawPending);
        const first = (p.name || "").split(" ")[0] || "Team";
        return `${first}'s Team`;
      }
    } catch (e) {
      console.error(e);
    }
    return "";
  });
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState(() => {
    try {
      if (typeof window === "undefined") return [];
      const rawPending = localStorage.getItem("pendingRegistration");
      if (rawPending) {
        const p = JSON.parse(rawPending);
        if (p && (p.name || p.email)) {
          const uid = p.email ? `u_${p.email.replace(/[^a-zA-Z0-9@._-]/g, "")}` : `u_pending_${Date.now()}`;
          return [{ id: uid, name: p.name || "Pending User", email: p.email || "" }];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // NOTE: leader detection is derived from the first selected member (ids from pendingRegistration
  // use the `u_` prefix). We avoid storing leaderId separately to reduce setState-in-effect issues.

  const [allUsers, setAllUsers] = useState(() => {
    try {
      const users = [];
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("registrations");
        const regs = raw ? JSON.parse(raw) : null;
        if (Array.isArray(regs) && regs.length > 0) {
          regs.forEach((r) => users.push({ id: r.id, name: r.name || "Unknown", email: r.email || "" }));
        }
        // include pendingRegistration at the front if present
        const rawPending = localStorage.getItem("pendingRegistration");
        if (rawPending) {
          const p = JSON.parse(rawPending);
          if (p && (p.name || p.email)) {
            const uid = p.email ? `u_${p.email.replace(/[^a-zA-Z0-9@._-]/g, "")}` : `u_pending_${Date.now()}`;
            // only add if not present in regs
            const exists = users.find((u) => (u.email && p.email && u.email === p.email));
            if (!exists) users.unshift({ id: uid, name: p.name || "Pending User", email: p.email || "" });
          }
        }
      }
      if (users.length > 0) return users;
    } catch (e) {
      console.error(e);
    }
    return [
      { id: "u1", name: "Alice Johnson", email: "alice@example.com" },
      { id: "u2", name: "Bob Smith", email: "bob@example.com" },
      { id: "u3", name: "Carlos Reyes", email: "carlos@example.com" },
      { id: "u4", name: "Dana Lee", email: "dana@example.com" },
      { id: "u5", name: "Eve Park", email: "eve@example.com" },
    ];
  });

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
        const mapped = list.map((u) => ({
          id: u.sic_no || u.id || u.email || `${Date.now()}_${Math.random()}`,
          name: u.name || u.full_name || "",
          email: u.email || "",
          role: (u.role || u.roleName || (u.role && u.role.name) || "").toString(),
        }));
        // exclude ADMIN / SUPERADMIN
        const filtered = mapped.filter((u) => {
          const r = (u.role || "").toString().toLowerCase();
          return !(r === "admin" || r === "superadmin");
        });
        setAllUsers((prev) => {
          // preserve pendingRegistration at front if it exists in prev
          const pending = prev.length > 0 && String(prev[0].id).startsWith("u_") ? prev[0] : null;
          if (pending) {
            // ensure pending is first and not duplicated
            const withoutPending = filtered.filter((f) => f.email !== pending.email);
            return [pending, ...withoutPending];
          }
          return filtered;
        });
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

  // remove the consumed pendingRegistration so it doesn't linger in storage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem("pendingRegistration");
    } catch (e) {
      /* ignore */
    }
  }, []);

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
        const mapped = list.map((u) => ({
          id: u.sic_no || u.id || u.email || `${Date.now()}_${Math.random()}`,
          name: u.name || u.full_name || "",
          email: u.email || "",
          role: (u.role || u.roleName || (u.role && u.role.name) || "").toString(),
        }));
        // exclude ADMIN / SUPERADMIN
        const filtered = mapped.filter((u) => {
          const r = (u.role || "").toString().toLowerCase();
          return !(r === "admin" || r === "superadmin");
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
  const leaderPresent = Boolean(members && members.length > 0 && typeof members[0].id === "string" && members[0].id.startsWith("u_"));

  function addMember(user) {
    if (!user) return;
    setMembers((prev) => {
      if (prev.find((m) => m.id === user.id)) return prev;
      // if a leader exists, they can add only 2 team members in addition to themselves
      const maxAllowed = leaderPresent ? 3 : 4;
      if (prev.length >= maxAllowed) return prev;
      return [...prev, user];
    });
  }

  function removeMember(id) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSaveTeam(e) {
    e.preventDefault();
    const name = (teamName || "").trim();
    if (!name) {
      // non-blocking feedback via console; the UI could be improved to show inline errors
      console.warn("Please enter a team name.");
      return;
    }
    if (members.length === 0) {
      console.warn("Please add at least one member.");
      return;
    }

    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("teams") : null;
      const arr = raw ? JSON.parse(raw) : [];
      const team = { id: `t${Date.now()}`, teamName: name, members };
      const next = [team, ...(Array.isArray(arr) ? arr : [])];
      localStorage.setItem("teams", JSON.stringify(next));
      // show success toast then redirect
      setToastMsg("Team saved successfully");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/event");
      }, 1200);
    } catch (e) {
      console.error(e, "Failed to save team");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold">Event Registration</h1>
        <p className="mt-2 text-sm text-slate-600">Create a team for the event: add a team name, search for users and add them as members.</p>

        <form onSubmit={handleSaveTeam} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Team Name</label>
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="mt-2 block w-full border rounded-md px-3 py-2"
              placeholder="Team Awesome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Selected members</label>
            <div className="mt-2 space-y-2">
              {members.length === 0 && <div className="text-sm text-slate-500">No members yet.</div>}
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </div>
                  <div>
                    <button type="button" onClick={() => removeMember(m.id)} className="px-3 py-1 border rounded-md text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Search users</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2 block w-full border rounded-md px-3 py-2"
              placeholder="Search by name or email"
            />

            <div className="mt-3 grid grid-cols-1 gap-2">
              {results.length === 0 && <div className="text-sm text-slate-500">No users found.</div>}
              {results.slice(0, 4).map((u) => (
                <div key={u.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => addMember(u)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50"
                      disabled={members.find((m) => m.id === u.id) || members.length >= (leaderPresent ? 3 : 4)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.push("/event")} className="px-4 py-2 border rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save Team</button>
          </div>
        </form>
        {/* Toast */}
        {showToast && (
          <div className="fixed right-4 bottom-6 z-50">
            <div className="rounded-md bg-emerald-600 text-white px-4 py-2 shadow-md">
              {toastMsg}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
