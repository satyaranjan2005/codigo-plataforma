import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.svg" 
                alt="Codigo Logo" 
                className="w-16 h-16 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]"
              />
              <span className="font-semibold text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
                Codigo Plataforma
              </span>
            </Link>
            <p className="text-sm text-slate-600 text-center sm:text-left">
              Empowering students through technology and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <Link href="/event" className="hover:text-slate-900 transition-colors">Events</Link>
              <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
            </div>
          </div>

          {/* Event Information */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Current Event</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div>Design Mania 2024</div>
              <div>Nov 8-14, 2025</div>
              <div>Location: Seminar Hall</div>
              <Link href="/event" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                View Details →
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Us</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600 mb-4">
              <a href="mailto:siliconcodingclub@gmail.com" className="hover:text-slate-900 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                siliconcodingclub@gmail.com
              </a>
              <a href="tel:+916370577859" className="hover:text-slate-900 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 6370 577 859
              </a>
            </div>
            
            <h5 className="text-xs font-semibold text-slate-900 mb-2">Follow Us</h5>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/codigo_plataforma_sit/" className="text-slate-600 hover:text-slate-900 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/codigo-plataforma/" className="text-slate-600 hover:text-slate-900 transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Codigo Plataforma. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
