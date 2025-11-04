import api from "./api";

// Helper to keep the logged-in user's local authUser in sync with server
export async function syncAuthUserById(targetId) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("authUser");
    if (!raw) return;
    const auth = JSON.parse(raw);
    const authId = auth?.sic_no || auth?.sic || auth?.id || auth?.email;
    if (!authId) return;
    // If the changed user is not the current user, nothing to do
    if (String(authId) !== String(targetId)) return;

    // Try to fetch fresh user from server
    try {
      const res = await api.get(`/users/${encodeURIComponent(targetId)}`);
      const data = res?.data;
      // Accept either single object or { user: {} } or array
      const fresh = data && (Array.isArray(data) ? data[0] : (data.user || data));
      if (fresh) {
        localStorage.setItem("authUser", JSON.stringify(fresh));
        try { window.dispatchEvent(new Event("authChange")); } catch (e) { /* ignore */ }
        return;
      }
    } catch (err) {
      // ignore fetch error, will fallback to updating role locally
    }

    // Fallback: set role to ADMIN locally so UI updates immediately
    auth.role = auth.role || "ADMIN";
    auth.roleName = auth.roleName || "ADMIN";
    localStorage.setItem("authUser", JSON.stringify(auth));
    try { window.dispatchEvent(new Event("authChange")); } catch (e) { /* ignore */ }
  } catch (e) {
    // ignore
  }
}

const authHelpers = {
  syncAuthUserById,
};

export default authHelpers;
