"use client";
import React, { useEffect, useState } from "react";
import MembersList from "../../../../../components/MembersList";
import AddMemberModal from "../../../../../components/AddMemberModal";
import { Plus } from "lucide-react";

export default function RegistrationPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("registrations") : null;
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return [
      { id: "r1", name: "John Doe", email: "john@example.com", sic: "SIC001" },
      { id: "r2", name: "Jane Roe", email: "jane@example.com", sic: "SIC002" },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("registrations", JSON.stringify(registrations));
    } catch (e) {}
  }, [registrations]);

  function handleAdd(reg) {
    setRegistrations((s) => [reg, ...s]);
  }

  function handleDelete(id) {
    if (!confirm("Delete this registration?")) return;
    setRegistrations((s) => s.filter((r) => r.id !== id));
  }

  function exportCSV() {
    if (!registrations || registrations.length === 0) return;
    const headers = ["Name", "SIC", "Email"];
    const rows = registrations.map((r) => [r.name, r.sic || "", r.email]);
    const csv = [headers, ...rows].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    if (!registrations || registrations.length === 0) return;
    const win = window.open("", "_blank", "noopener,noreferrer");
    if (!win) return;
    const style = `
      <style>
        body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #f3f4f6; text-align: left; }
      </style>
    `;
    const rows = registrations
      .map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.sic || "")}</td><td>${escapeHtml(r.email)}</td></tr>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>
      <h2>Registrations</h2>
      <table><thead><tr><th>Name</th><th>SIC</th><th>Email</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;
    win.document.write(html);
    win.document.close();
    // give the window time to render then trigger print
    setTimeout(() => {
      win.focus();
      win.print();
    }, 250);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Event Registrations</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportPDF} className="px-3 py-2 bg-gray-700 text-white rounded-md">Export PDF</button>
          <button onClick={exportCSV} className="px-3 py-2 bg-green-700 text-white rounded-md">Export Excel</button>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Add registration"
            title="Add registration"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MembersList members={registrations} onDelete={handleDelete} />

      <AddMemberModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} title={"Add registration"} showForm={true} />
    </div>
  );
}
