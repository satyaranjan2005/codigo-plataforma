"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

export default function NotificationsPanel({ open, onClose, items = [] }) {
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!open) return
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-lg rounded-md z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="text-sm font-medium">Notifications</div>
        <button aria-label="Close notifications" onClick={onClose} className="p-1 rounded hover:bg-slate-100">
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="max-h-64 overflow-auto">
        {items.length === 0 && (
          <div className="p-4 text-sm text-slate-500">No notifications</div>
        )}

        {items.map((it, idx) => (
          <div key={idx} className="px-4 py-3 hover:bg-slate-50 border-b last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">{it.icon || "🔔"}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{it.title}</div>
                <div className="text-xs text-slate-500">{it.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t text-center">
        <button className="text-sm text-indigo-600 hover:underline">View all</button>
      </div>
    </div>
  )
}
