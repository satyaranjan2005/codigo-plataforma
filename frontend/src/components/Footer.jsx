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
                className="w-18 h-18 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]"
              />
              <span className="font-semibold text-slate-900 transition-colors duration-300 group-hover:text-slate-700">
                Codigo Plataforma
              </span>
            </Link>
          </div>

          {/* 2nd Year Coordinators */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-medium text-slate-900 mb-3">2nd Year Coordinators</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div>Coordinator Name 1</div>
              <div>Coordinator Name 2</div>
            </div>
          </div>

          {/* 3rd Year Coordinators */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-medium text-slate-900 mb-3">3rd Year Coordinators</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div>Coordinator Name 1</div>
              <div>Coordinator Name 2</div>
            </div>
          </div>

          {/* 4th Year Coordinators */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-sm font-medium text-slate-900 mb-3">4th Year Coordinators</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-600">
              <div>Coordinator Name 1</div>
              <div>Coordinator Name 2</div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="border-t border-slate-100 pt-6 mb-6">
          <h4 className="text-sm font-medium text-slate-900 mb-3 text-center">Contact Us</h4>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-600">
            <a href="mailto:contact@codigo.com" className="hover:text-slate-900 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@codigo.com
            </a>
            <a href="tel:+1234567890" className="hover:text-slate-900 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +1 (234) 567-890
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Codigo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
