"use client";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Events from "@/components/Events";

function Home(){
  const [authUser, setAuthUser] = useState(null);
  const [validating, setValidating] = useState(false);

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

  return(
    <div className="space-y-12 p-6 md:p-8 lg:p-12">
      <Hero />
      <About />
      <Events />
    </div>
  );
}

export default Home;