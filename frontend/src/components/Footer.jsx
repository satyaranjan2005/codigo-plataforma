import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">CP</div>
              <div>
                <p className="font-semibold text-slate-900">Codigo</p>
                <p className="text-sm text-slate-500">Build modern UIs faster.</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-8">
            <div className="mb-4 sm:mb-0">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Product</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li><Link href="/" className="hover:underline">Overview</Link></li>
                <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
                <li><Link href="/docs" className="hover:underline">Docs</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Company</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li><Link href="/about" className="hover:underline">About</Link></li>
                <li><Link href="/careers" className="hover:underline">Careers</Link></li>
                <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-2">Stay up to date</h4>
            <p className="text-sm text-slate-600 mb-3">Get the latest updates and releases.</p>
            <form className="flex gap-2">
              <input aria-label="Email" type="email" placeholder="you@site.com" className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-300" />
              <button type="submit" className="px-3 py-2 rounded-md bg-slate-900 text-white text-sm">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Codigo. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
