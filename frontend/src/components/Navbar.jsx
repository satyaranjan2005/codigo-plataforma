"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Inbox, LogOut } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return Boolean(localStorage.getItem("authToken"));
    } catch (e) {
      return false;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
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
      } catch (e) { /* ignore */ }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChange", onAuthChange);
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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">CP</div>
              <span className="font-semibold text-slate-900">Codigo</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {l.label}
                </Link>
              ))}
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
                  <button aria-label="Inbox" title="Inbox" onClick={() => router.push('/inbox')} className="p-2 rounded-md hover:bg-slate-100">
                    <Inbox className="w-5 h-5 text-slate-700" />
                  </button>
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
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
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
