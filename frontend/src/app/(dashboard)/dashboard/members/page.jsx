"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import MembersList from "../../../../components/MembersList";
import AddMemberModal from "../../../../components/AddMemberModal";
import SuperAdminGuard from "../../../../components/SuperAdminGuard";
import api from "@/lib/api";

function MembersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("members") : null;
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }

    // default sample members (include team, role and sic)
    return [
      { id: "1", name: "Alice Johnson", email: "alice@example.com", sic: "SIC100", team: "Alpha", role: "Member" },
      { id: "2", name: "Bob Smith", email: "bob@example.com", sic: "SIC101", team: "Beta", role: "Admin" },
      { id: "3", name: "Clara Oswald", email: "clara@example.com", sic: "SIC102", team: "Alpha", role: "Member" },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("members", JSON.stringify(members));
    } catch (e) {}
  }, [members]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users");
        const data = res?.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
        if (!mounted) return;
        setMembers(
          list.map((u) => ({
            id: u.sic_no || u.id || u.sic || u.email,
            name: u.name || u.full_name || "",
            email: u.email || "",
            role: (u.role || u.roleName || (u.role && u.role.name) || "").toString(),
            sic: u.sic_no || u.sic || u.id,
          }))
        );
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

  function handleAdd(member) {
    setMembers((s) => [member, ...s]);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this member?")) return;
    // find member to get sic number
    const member = members.find((m) => m.id === id) || {};
    const sic = member.sic || member.id || id;
    try {
      // call demote endpoint for the member
      await api.post(`/users/${encodeURIComponent(sic)}/demote`);
      // remove from UI on success
      setMembers((s) => s.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to demote member:", err);
      // basic user feedback
      alert("Failed to demote member. Please try again.");
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-semibold">Members</h2>
        <div>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Add member"
            title="Add member"
            className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

  {/* show only admins and superadmins */}
  <div>
    {loading ? (
      <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm text-center text-sm sm:text-base">Loading…</div>
    ) : error ? (
      <div className="p-4 sm:p-6 bg-white rounded-md shadow-sm text-center text-rose-600 text-sm sm:text-base">{error}</div>
    ) : (
      (() => {
        const visible = members.filter((m) => {
          const r = (m.role || "").toString().toLowerCase();
          return r === "admin" || r === "superadmin";
        });
        return <MembersList members={visible} onDelete={handleDelete} />;
      })()
    )}
  </div>

      <AddMemberModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}

export default function ProtectedMembersPage() {
  return (
    <SuperAdminGuard>
      <MembersPage />
    </SuperAdminGuard>
  );
}
