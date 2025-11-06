"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { get } from "@/lib/api";
import clsx from "clsx";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // Start with conservative defaults so server and client markup match.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // no dropdown menu - show quick action icons instead
  const router = useRouter();

  useEffect(() => {
    // keep existing storage handler for authToken and authUser
    function onStorage(e) {
      if (e.key === "authToken") {
        setIsAuthenticated(Boolean(e.newValue));
      }
      if (e.key === "authUser") {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); } catch (err) { setUser(null); }
      }
    }

    function onAuthChange() {
      try {
        setIsAuthenticated(Boolean(localStorage.getItem("authToken")));
        const raw = localStorage.getItem("authUser");
        setUser(raw ? JSON.parse(raw) : null);
        // validate freshly from server whenever auth changes
        validateAuthUser();
      } catch (e) { /* ignore */ }
    }

    async function validateAuthUser() {
      try {
        const raw = localStorage.getItem("authUser");
        if (!raw) return;
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
        if (!parsed) return;
        const id = parsed.sic || parsed.sic_no || parsed.id || parsed.email;
        if (!id) {
          // no identifier -> sign out
          try { localStorage.removeItem("authToken"); localStorage.removeItem("authUser"); } catch (e) {}
          try { window.dispatchEvent(new Event("authChange")); } catch (e) {}
          try { router.replace("/"); } catch (e) {}
          return;
        }
        try {
          const res = await get(`/users/${encodeURIComponent(String(id))}`);
          const data = res?.data || res;
          const fresh = data && (Array.isArray(data) ? data[0] : (data.user || data));
          if (!fresh) {
            // user not found on server -> logout
            try { localStorage.removeItem("authToken"); localStorage.removeItem("authUser"); } catch (e) {}
            try { window.dispatchEvent(new Event("authChange")); } catch (e) {}
            try { router.replace("/"); } catch (e) {}
            return;
          }
          // update local authUser with fresh data if differs
          try {
            const serialized = JSON.stringify(fresh);
            if (serialized !== raw) {
              localStorage.setItem("authUser", serialized);
              try { window.dispatchEvent(new Event("authChange")); } catch (e) {}
            }
            setUser(fresh);
          } catch (e) { /* ignore */ }
        } catch (err) {
          // on network / auth error, if 401 clear token
          if (err?.response?.status === 401) {
            try { localStorage.removeItem("authToken"); localStorage.removeItem("authUser"); } catch (e) {}
            try { window.dispatchEvent(new Event("authChange")); } catch (e) {}
            try { router.replace("/"); } catch (e) {}
          }
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChange", onAuthChange);

  // Initialize auth state on mount (client-only) to avoid reading localStorage during SSR/hydration.
  onAuthChange();

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChange", onAuthChange);
    };
  }, []);

  // no outside click handler required when there is no dropdown

  function handleSignOut() {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } catch (e) {
      // ignore
    }
  window.dispatchEvent(new Event("authChange"));
  setIsAuthenticated(false);
  setUser(null);
    try { router.push("/"); } catch (e) { /* ignore */ }
  }

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">CP</div>
              <span className="font-semibold text-slate-900">Codigo</span>
            </Link> */}

          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.svg" 
              alt="Codigo Logo"
              className="w-18 h-18 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]"
            />
            <span className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors duration-300">
              Codigo Plataforma
            </span>
          </Link>


            <nav className="hidden md:flex items-center space-x-2">
              {NAV_LINKS.map((l) => {
                // only show dashboard link to admin / superadmin
                if (l.href === '/dashboard') {
                  const role = (user?.role || user?.roleName || '').toString().toLowerCase();
                  if (!(role === 'admin' || role === 'superadmin' || role === 'administrator')) return null;
                }
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* desktop actions */}
            <div className="hidden md:flex items-center gap-2 overflow-visible">
              {!isAuthenticated ? (
                <>

                  <Link
                    href="/login"
                    className="text-sm px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:opacity-95"
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <div className="inline-flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                    {user && user.name ? (user.name.split(' ')[0][0] || user.name[0]) : (user?.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="text-sm text-slate-700 mr-2">{user?.name || user?.email || 'User'}</div>
                  <button aria-label="Sign out" title="Sign out" onClick={handleSignOut} className="p-2 rounded-md hover:bg-slate-100">
                    <LogOut className="w-5 h-5 text-rose-600" />
                  </button>
                </div>
              )}
            </div>

            {/* mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile panel */}
            <div className={clsx("md:hidden bg-white border-t border-slate-100", open ? "block" : "hidden")}>
        <div className="px-4 pt-4 pb-6 space-y-2">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((l) => {
              if (l.href === '/dashboard') {
                const role = (user?.role || user?.roleName || '').toString().toLowerCase();
                if (!(role === 'admin' || role === 'superadmin' || role === 'administrator')) return null;
              }
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50">Sign in</Link>
                <Link href="/register" className="mt-2 block px-3 py-2 rounded-md bg-slate-900 text-white text-sm text-center">Get started</Link>
              </>
            ) : (
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium">
                    {user && user.name ? (user.name.split(' ')[0][0] || user.name[0]) : (user?.email ? user.email[0].toUpperCase() : 'U')}
                  </div>
                  <div className="text-sm text-slate-700">{user?.name || user?.email || 'User'}</div>
                </div>
                <div className="mt-2">
                  <button onClick={handleSignOut} className="text-sm text-rose-600 hover:underline">Sign out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
