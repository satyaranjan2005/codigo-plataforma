"use client";

import { useState } from "react";
import Image from "next/image";

function Preview({ src, alt, className }) {
  if (!src) return <div className={`bg-gray-100 border border-dashed rounded ${className} flex items-center justify-center text-sm text-gray-500`}>No image</div>;
  // next/image helps satisfy lint rules and gives optimizations
  return <Image src={src} alt={alt} width={144} height={144} className={`object-cover rounded ${className}`} />;
}

export default function EventsPage() {
  const storageKey = "eventAssets";
  const [logo, setLogo] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw).logo || null;
    } catch (e) {
      return null;
    }
  });

  const [banner, setBanner] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw).banner || null;
    } catch (e) {
      return null;
    }
  });

  const [about, setAbout] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return "";
      return JSON.parse(raw).about || "";
    } catch (e) {
      return "";
    }
  });

  const [importantDate, setImportantDate] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return "";
      return JSON.parse(raw).importantDate || "";
    } catch (e) {
      return "";
    }
  });

  const [organiserContact, setOrganiserContact] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return "";
      return JSON.parse(raw).organiserContact || "";
    } catch (e) {
      return "";
    }
  });

  const [stages, setStages] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      return JSON.parse(raw).stages || [];
    } catch (e) {
      return [];
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [stageForm, setStageForm] = useState({ title: "", start: "", end: "", description: "" });

  // prizes / rewards
  const [prizes, setPrizes] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      return JSON.parse(raw).prizes || [];
    } catch (e) {
      return [];
    }
  });
  const [prizeEditingId, setPrizeEditingId] = useState(null);
  const [prizeForm, setPrizeForm] = useState({ title: "", amount: "", description: "" });

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  async function handleFileChange(e, setFn) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // quick client-side check
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFn(dataUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to read file");
    }
  }

  function startAddStage() {
    setEditingId(null);
    setStageForm({ title: "", start: "", end: "", description: "" });
  }

  function startEditStage(id) {
    const s = stages.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setStageForm({ title: s.title || "", start: s.start || "", end: s.end || "", description: s.description || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveStage() {
    const { title, start, end, description } = stageForm;
    if (!title) {
      alert("Please enter a stage title.");
      return;
    }
    if (editingId) {
      setStages((prev) => prev.map((s) => (s.id === editingId ? { ...s, title, start, end, description } : s)));
      setEditingId(null);
    } else {
      const newStage = { id: Date.now(), title, start, end, description };
      setStages((prev) => [...prev, newStage]);
    }
    setStageForm({ title: "", start: "", end: "", description: "" });
  }

  function removeStage(id) {
    if (!confirm("Remove this stage?")) return;
    setStages((prev) => prev.filter((s) => s.id !== id));
  }

  // Prizes: add / edit / remove
  function startAddPrize() {
    setPrizeEditingId(null);
    setPrizeForm({ title: "", amount: "", description: "" });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function startEditPrize(id) {
    const p = prizes.find((x) => x.id === id);
    if (!p) return;
    setPrizeEditingId(id);
    setPrizeForm({ title: p.title || "", amount: p.amount || "", description: p.description || "" });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  function savePrize() {
    const { title, amount, description } = prizeForm;
    if (!title) {
      alert("Please enter a prize title.");
      return;
    }
    if (prizeEditingId) {
      setPrizes((prev) => prev.map((p) => (p.id === prizeEditingId ? { ...p, title, amount, description } : p)));
      setPrizeEditingId(null);
    } else {
      const newPrize = { id: Date.now(), title, amount, description };
      setPrizes((prev) => [...prev, newPrize]);
    }
    setPrizeForm({ title: "", amount: "", description: "" });
  }

  function removePrize(id) {
    if (!confirm("Remove this prize?")) return;
    setPrizes((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSave() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ logo, banner, stages, about, importantDate, organiserContact, prizes }));
      alert("Event assets saved (stored in your browser).");
    } catch (e) {
      console.error(e);
      alert("Failed to save assets to localStorage.");
    }
  }

  function handleRemove(which) {
    if (which === "logo") setLogo(null);
    if (which === "banner") setBanner(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Event Assets</h2>
        <p className="text-sm text-gray-500">Upload a logo and a banner image for the event. Images are stored in your browser (localStorage) for now.</p>
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo (square recommended)</label>
          <div className="w-36 h-36">
            <Preview src={logo} alt="Event logo" className="w-36 h-36" />
          </div>
          <input
            aria-label="Upload logo"
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) => handleFileChange(e, setLogo)}
          />
          {logo && (
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded bg-red-500 text-white text-sm" onClick={() => handleRemove("logo")}>Remove</button>
              <a className="px-3 py-1 rounded bg-gray-100 text-sm" href={logo} target="_blank" rel="noreferrer">Open</a>
            </div>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Banner (wide recommended)</label>
          <div className="w-full h-40 bg-gray-50 border border-dashed rounded overflow-hidden relative">
            {banner ? (
              <Image src={banner} alt="Event banner" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No banner uploaded</div>
            )}
          </div>
          <input
            aria-label="Upload banner"
            type="file"
            accept="image/*"
            className="mt-3"
            onChange={(e) => handleFileChange(e, setBanner)}
          />
          {banner && (
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded bg-red-500 text-white text-sm" onClick={() => handleRemove("banner")}>Remove</button>
              <a className="px-3 py-1 rounded bg-gray-100 text-sm" href={banner} target="_blank" rel="noreferrer">Open</a>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t flex items-center gap-3">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleSave}>Save assets</button>
        <button
          className="px-4 py-2 rounded bg-gray-100"
          onClick={() => {
            // reload from storage
            try {
              const raw = localStorage.getItem(storageKey);
              if (raw) {
                  const parsed = JSON.parse(raw);
                  setLogo(parsed.logo || null);
                  setBanner(parsed.banner || null);
                  setStages(parsed.stages || []);
                  setAbout(parsed.about || "");
                  setImportantDate(parsed.importantDate || "");
                  setOrganiserContact(parsed.organiserContact || "");
                  alert("Reloaded saved assets from localStorage.");
                } else {
                  alert("No saved assets found in localStorage.");
                }
            } catch (e) {
              console.error(e);
              alert("Failed to reload assets.");
            }
          }}
        >
          Reload
        </button>
        <button
          className="px-4 py-2 rounded bg-red-50 text-red-600"
          onClick={() => {
            localStorage.removeItem(storageKey);
            setLogo(null);
            setBanner(null);
            setStages([]);
            setAbout("");
            setImportantDate("");
            setOrganiserContact("");
            alert("Cleared saved event assets.");
          }}
        >
          Clear saved
        </button>
      </div>

      {/* Stages / Timeline section (moved to bottom) */}
      <div className="pt-6 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-medium">Event Stages & Timeline</h3>
            <p className="text-sm text-gray-500">Add stages for this event (e.g., Registration, Screening, Finals) with start/end dates.</p>
          </div>
          <div>
            <button className="px-3 py-1 rounded bg-green-600 text-white text-sm" onClick={startAddStage}>Add stage</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white border rounded p-4">
              <h4 className="font-medium mb-2">Stage details</h4>
              <div className="space-y-2">
                <input className="w-full border rounded px-3 py-2" placeholder="Title" value={stageForm.title} onChange={(e) => setStageForm((s) => ({ ...s, title: e.target.value }))} />
                <div className="flex gap-2">
                  <input type="date" className="w-1/2 border rounded px-3 py-2" value={stageForm.start} onChange={(e) => setStageForm((s) => ({ ...s, start: e.target.value }))} />
                  <input type="date" className="w-1/2 border rounded px-3 py-2" value={stageForm.end} onChange={(e) => setStageForm((s) => ({ ...s, end: e.target.value }))} />
                </div>
                <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Description (optional)" value={stageForm.description} onChange={(e) => setStageForm((s) => ({ ...s, description: e.target.value }))} />
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={saveStage}>{editingId ? "Update stage" : "Save stage"}</button>
                  <button className="px-3 py-1 rounded bg-gray-100 text-sm" onClick={() => { startAddStage(); }}>Reset</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              {stages.length === 0 ? (
                <div className="text-sm text-gray-500">No stages added yet.</div>
              ) : (
                stages.map((s) => (
                  <div key={s.id} className="border rounded p-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-gray-500">{s.start || "-"} — {s.end || "-"}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-sm px-2 py-1 rounded bg-yellow-100" onClick={() => startEditStage(s.id)}>Edit</button>
                        <button className="text-sm px-2 py-1 rounded bg-red-100 text-red-600" onClick={() => removeStage(s.id)}>Delete</button>
                      </div>
                    </div>
                    {s.description && <div className="mt-2 text-sm text-gray-600">{s.description}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* About the event (moved to bottom) */}
      <div className="pt-6 border-t">
        <h3 className="text-md font-medium">About the event</h3>
        <p className="text-sm text-gray-500 mb-2">A short summary that describes the event. This will be saved locally for now.</p>
        <textarea
          rows={6}
          className="w-full border rounded px-3 py-2"
          placeholder="Write a short summary of the event..."
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Important date</label>
            <input type="date" className="w-full border rounded px-3 py-2 mt-1" value={importantDate} onChange={(e) => setImportantDate(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Main date attendees should remember (e.g., event day or deadline).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact the organisers</label>
            <textarea rows={3} className="w-full border rounded px-3 py-2 mt-1" placeholder="Name / email / phone / other contact info" value={organiserContact} onChange={(e) => setOrganiserContact(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Provide phone, email or other contact details for event organisers.</p>
          </div>
        </div>
        {/* Rewards & Prizes */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium">Rewards & Prizes</h4>
              <p className="text-sm text-gray-500">Add prize entries for winners. You can specify title, amount and an optional description.</p>
            </div>
            <div>
              <button className="px-3 py-1 rounded bg-green-600 text-white text-sm" onClick={startAddPrize}>Add prize</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-white border rounded p-4">
                <h5 className="font-medium mb-2">Prize details</h5>
                <div className="space-y-2">
                  <input className="w-full border rounded px-3 py-2" placeholder="Prize title (e.g., 1st Prize)" value={prizeForm.title} onChange={(e) => setPrizeForm((p) => ({ ...p, title: e.target.value }))} />
                  <input className="w-full border rounded px-3 py-2" placeholder="Amount (e.g., $500)" value={prizeForm.amount} onChange={(e) => setPrizeForm((p) => ({ ...p, amount: e.target.value }))} />
                  <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Description (optional)" value={prizeForm.description} onChange={(e) => setPrizeForm((p) => ({ ...p, description: e.target.value }))} />
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={savePrize}>{prizeEditingId ? "Update prize" : "Save prize"}</button>
                    <button className="px-3 py-1 rounded bg-gray-100 text-sm" onClick={() => startAddPrize()}>Reset</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-3">
                {prizes.length === 0 ? (
                  <div className="text-sm text-gray-500">No prizes added yet.</div>
                ) : (
                  prizes.map((p) => (
                    <div key={p.id} className="border rounded p-3 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{p.title} {p.amount ? <span className="text-sm text-gray-500">— {p.amount}</span> : null}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm px-2 py-1 rounded bg-yellow-100" onClick={() => startEditPrize(p.id)}>Edit</button>
                          <button className="text-sm px-2 py-1 rounded bg-red-100 text-red-600" onClick={() => removePrize(p.id)}>Delete</button>
                        </div>
                      </div>
                      {p.description && <div className="mt-2 text-sm text-gray-600">{p.description}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
