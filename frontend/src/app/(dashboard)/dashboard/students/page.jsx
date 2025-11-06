"use client";
import React, { useEffect, useState } from "react";
import MembersList from "../../../../components/MembersList";
import AddMemberModal from "../../../../components/AddMemberModal";
import SuperAdminGuard from "../../../../components/SuperAdminGuard";
import { Plus } from "lucide-react";
import api from "@/lib/api";

function StudentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [students, setStudents] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("students") : null;
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    // default sample students
    return [
      { id: "s1", name: "Grace Hopper", email: "grace@example.com" },
      { id: "s2", name: "Alan Turing", email: "alan@example.com" },
    ];
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("students", JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  // fetch users from API on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users");
        if (!mounted) return;
        const data = res?.data;
        // Accept either an array or { users: [] }
        const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : null;
        if (list) {
            setStudents(
              list.map((u) => ({
                id: u.sic_no,
                name: u.name,
                email: u.email,
                sic: u.sic_no,
              }))
            );
        }
      } catch (err) {
        console.warn("Failed to load users:", err);
        if (mounted) setError(err?.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function handleAdd(student) {
    setStudents((s) => [student, ...s]);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student?")) return;
    // call backend to delete by sic (id)
    try {
      await api.delete(`/users/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn("Failed to delete user:", err);
      setError(err?.message || "Failed to delete user");
      return;
    }
    // remove locally on success
    setStudents((s) => s.filter((m) => m.id !== id));
  }

  const sampleStudents = [
    { name: "Lina Perez", email: "lina.p@example.com" },
    { name: "Mohammed Khan", email: "mohammed.k@example.com" },
    { name: "Sara Lee", email: "sara.lee@example.com" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Add student"
            title="Add student"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600">{loading ? "Loading students..." : `${students.length} students`}</div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded-md shadow-sm text-center">Loading…</div>
        ) : (
          <MembersList members={students} onDelete={handleDelete} showRole={false} />
        )}
      </div>

      <AddMemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        sampleUsers={sampleStudents}
        title={"Add student"}
        showForm={true}
      />
    </div>
  );
}

export default function ProtectedStudentsPage() {
  return (
    <SuperAdminGuard>
      <StudentsPage />
    </SuperAdminGuard>
  );
}