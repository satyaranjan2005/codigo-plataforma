"use client";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Events from "@/components/Events";
import Winner from "@/components/Winner";

function Home(){
  const [authUser, setAuthUser] = useState(null);
  const [validating, setValidating] = useState(false);
  const [isWinnersUnlocked, setIsWinnersUnlocked] = useState(false);

  // Check if user exists on mount
  useEffect(() => {
    let mounted = true;
    
    async function verifyUser() {
      if (validating) return; // Prevent multiple validations
      
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
        const parsed = raw ? JSON.parse(raw) : null;
        
        if (!parsed) {
          if (mounted) setAuthUser(null);
          return;
        }
        
        if (mounted) setAuthUser(parsed);
        
        // Only validate if user is logged in
        const userId = parsed.sic_no || parsed.sic || parsed.id;
        if (userId) {
          setValidating(true);
          try {
            const userCheck = await get(`/users/${userId}`);
            console.log('User validation:', userCheck);
            
            if (!userCheck || userCheck.error) {
              // User doesn't exist on server, auto logout
              console.warn('User not found on server, logging out...');
              if (typeof window !== 'undefined' && mounted) {
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sic_no');
                localStorage.removeItem('name');
                localStorage.removeItem('email');
                window.dispatchEvent(new Event('authChange'));
                window.location.href = '/login';
              }
              return;
            }
          } catch (err) {
            // If 401 or 404, user doesn't exist or token is invalid
            if (err?.response?.status === 401 || err?.response?.status === 404) {
              console.warn('User authentication failed, logging out...', err);
              if (typeof window !== 'undefined' && mounted) {
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sic_no');
                localStorage.removeItem('name');
                localStorage.removeItem('email');
                window.dispatchEvent(new Event('authChange'));
                window.location.href = '/login';
              }
              return;
            }
            // For other errors, just log and continue (might be network issue)
            console.warn('Failed to verify user (non-critical):', err);
          } finally {
            if (mounted) setValidating(false);
          }
        }
      } catch (e) {
        console.warn('Error verifying user:', e);
        if (mounted) {
          setAuthUser(null);
          setValidating(false);
        }
      }
    }
    
    // Add a small delay to allow localStorage to be fully set after login
    const timer = setTimeout(() => {
      verifyUser();
    }, 100);
    
    // Listen for auth changes
    function onAuthChange() {
      setTimeout(() => verifyUser(), 100);
    }
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, [validating]);

  // Check winners unlock time (visible to everyone after unlock)
  useEffect(() => {
    function checkWinnersUnlock() {
      try {
        const unlockStr = process.env.NEXT_PUBLIC_WINNERS_UNLOCK_TIME;
        if (!unlockStr) {
          // if not set, keep unlocked = false
          setIsWinnersUnlocked(false);
          return;
        }
        const unlockTime = new Date(unlockStr);
        if (isNaN(unlockTime.getTime())) {
          setIsWinnersUnlocked(false);
          return;
        }
        const now = new Date();
        setIsWinnersUnlocked(now >= unlockTime);
      } catch (e) {
        console.warn('Failed to parse NEXT_PUBLIC_WINNERS_UNLOCK_TIME', e);
        setIsWinnersUnlocked(false);
      }
    }

    checkWinnersUnlock();
    const t = setInterval(checkWinnersUnlock, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll to winners section when unlocked and page is opened
  useEffect(() => {
    try {
      if (!isWinnersUnlocked) return;
      // Wait briefly for layout to settle
      const id = setTimeout(() => {
        const el = typeof document !== 'undefined' ? document.getElementById('winners-section') : null;
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
      return () => clearTimeout(id);
    } catch (e) {
      // ignore
    }
  }, [isWinnersUnlocked]);

  return(
    <div className="space-y-8 sm:space-y-10 md:space-y-12 p-4 sm:p-6 md:p-8 lg:p-12">
      <Hero />
      <About />
      <Events />

      {/* Winners section - unlocked based on env NEXT_PUBLIC_WINNERS_UNLOCK_TIME */}
      <div id="winners-section">
        {isWinnersUnlocked ? (
          <Winner />
        ) : (
          <section className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold">Design Mania — Winners</h2>
            <p className="text-sm text-slate-600 mt-1">Winners will be announced soon.</p>
            {process.env.NEXT_PUBLIC_WINNERS_UNLOCK_TIME && (
              <div className="mt-3 text-xs text-slate-500">Announcement time: {new Date(process.env.NEXT_PUBLIC_WINNERS_UNLOCK_TIME).toLocaleString()}</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Home;