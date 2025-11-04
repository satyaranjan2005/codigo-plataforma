"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { syncAuthUserById } from "@/lib/auth";

export default function AddMemberModal({ isOpen, onClose, onAdd, sampleUsers = [], title = "Add member", showForm = false }) {
  // search state for sample users
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);
  const [addLoading, setAddLoading] = useState(false);

  // form state for student add (optional)
  const [formName, setFormName] = useState("");
  const [formSic, setFormSic] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  const idCounterRef = useRef(1);

  const doRemoteSearch = useCallback(async (q) => {
    // keep this callback stable (no external array deps)
    if (!q) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      // call backend search endpoint: /search?q=...
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      const data = res?.data;
      // Accept array or { users: [] }
      const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      // normalize to { name, email, sic }
      const mapped = list.map((u) => ({
        name: u.name || u.full_name || u.displayName || "",
        email: u.email || u.user_email || "",
        sic: u.sic_no || u.sic || u.id || undefined,
        raw: u,
      }));
      setResults(mapped.length ? mapped : []);
    } catch (err) {
      console.warn("Search failed:", err);
      setSearchError(err?.message || "Search failed");
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  function handleSearch(e) {
    e && e.preventDefault && e.preventDefault();
    const q = (query || "").trim();
    // trigger immediate search on button click
    if (!q) {
      setResults([]);
      return;
    }
    doRemoteSearch(q);
  }

  // Debounced auto-search when query changes
  useEffect(() => {
    const q = (query || "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) {
      setResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      doRemoteSearch(q);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doRemoteSearch]);

  // Do not render when closed (after hooks)
  if (!isOpen) return null;

  async function handleAddSample(u) {
    // If there's a SIC (or id), call the API to assign role first
    const sic = u.sic || u.id || u.sic_no;
    setAddLoading(true);
    if (sic) {
      try {
        await api.patch(`/users/${sic}/role`, { role: "ADMIN" });
        // sync authUser in this browser if the promoted user is the current user
        try {
          await syncAuthUserById(sic);
        } catch (err) {
          // non-fatal
        }
      } catch (err) {
        console.warn("Failed to assign role:", err);
        setSearchError(err?.message || "Failed to assign role");
        setAddLoading(false);
        return;
      }
    }

    const newMember = {
      id: sic || `sample-${idCounterRef.current++}`,
      name: u.name,
      email: u.email,
      sic: sic,
    };
    onAdd && onAdd(newMember);
    onClose && onClose();
    setAddLoading(false);
  }

  function handleSubmitStudent(e) {
    e && e.preventDefault && e.preventDefault();
    if (!formName.trim() || !formSic.trim() || !formEmail.trim() || !formPassword) {
      // basic validation
      return;
    }

    const student = {
      id: `student-${idCounterRef.current++}`,
      name: formName.trim(),
      sic: formSic.trim(),
      email: formEmail.trim(),
      password: formPassword,
    };

    onAdd && onAdd(student);
    onClose && onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-lg font-medium">{title}</h3>

        {showForm ? (
          <form onSubmit={handleSubmitStudent} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SIC</label>
              <input
                value={formSic}
                onChange={(e) => setFormSic(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="SIC/Student ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="Password"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-md">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
                Add student
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Search users */}
            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users by name, email or SIC"
                className="flex-1 rounded-md border px-3 py-2"
              />
              <button type="submit" onClick={handleSearch} className="px-4 py-2 text-white bg-gray-800 rounded-md">
                Search
              </button>
            </form>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Search results</h4>
              <div className="space-y-2">
                {searchLoading && <p className="text-sm text-gray-500">Searching…</p>}
                {!searchLoading && results.length === 0 && <p className="text-sm text-gray-500">No results.</p>}
                {results.map((u, idx) => (
                  <div key={(u.email || u.sic || idx) + idx} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}{u.sic ? ` — ${u.sic}` : ""}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleAddSample(u)}
                        disabled={addLoading || searchLoading}
                        className={"px-3 py-1 text-sm text-white rounded-md " + (addLoading || searchLoading ? "bg-green-400 opacity-70" : "bg-green-600 hover:bg-green-700")}
                      >
                        {addLoading ? "Adding…" : "Add"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
