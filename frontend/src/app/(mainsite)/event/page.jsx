"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Professional event demo page
const demoEvent = {
  title: "Design Mania",
  subtitle: "Competition",
  banner: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=1f1b7f7d8a8f0c2b1d6b1f9b2a7c3d4e",
  logo: "https://images.unsplash.com/photo-1520975914723-8d3b2f3d9f1f?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&s=4b2a6d7f8e9a0b1c2d3e4f5a6b7c8d9e",
  about:
    "Design Mania 2024 presented by Codigo Plataforma is an individual UI/UX design competition where participants will demonstrate their research, creativity, and design skills. Participants will receive a case study, and they will have 24 hours to conduct research. Once research is submitted, participants will then design according to the case study.",
  importantDate: "2025-11-13",
  organiserContact: "Codigo Platforma\nEmail: siliconcodingclub@gmail.com\nPhone: +91 6370 577 859",
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
  const [regCount, setRegCount] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("registrations") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  });

  const [teamSize, setTeamSize] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("eventAssets") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.teamSize ?? null;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  // Modal state for showing rules before registration
  const [showRules, setShowRules] = useState(false);
  const [pendingReg, setPendingReg] = useState({ name: "", email: "" });
  const [authUser, setAuthUser] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("authUser");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  });

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
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
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
          <img src={demoEvent.banner} alt="Event banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        </div>
        {/* logo/title card moved below the banner */}
      </section>

  <section className="container mx-auto px-4 mt-6 md:mt-10">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg shadow-lg p-4 md:p-6 flex items-center gap-4 md:gap-6">
          <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded overflow-hidden bg-white">
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
                    <div className="flex-shrink-0 mt-1">
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
                      {/* Link to view the Case Study details */}
                      {s.id === 2 && (
                        <div className="mt-3">
                          <a
                            href="/DesignMania-CaseStudy.pdf"
                            download
                            className="inline-block px-3 py-2 bg-amber-500 text-white rounded-md text-sm hover:bg-amber-600 transition"
                          >
                            View Case Study
                          </a>
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
                        <button
                          onClick={() => {
                            setPendingReg({ name: authUser?.name ?? "Demo User", email: authUser?.email ?? "demo.user@example.com" });
                            setShowRules(true);
                          }}
                          className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md"
                        >
                          Register
                        </button>
                      </div>
                      <div className="mt-3 text-sm text-slate-700">
                        <div>Total registered: <span className="font-semibold">{regCount}</span></div>
                        <div>Team size: <span className="font-semibold">{teamSize ? `${teamSize}` : 'Not set'}</span></div>
                      </div>
                    </div>

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
