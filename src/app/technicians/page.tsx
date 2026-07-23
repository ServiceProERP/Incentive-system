// src/app/technicians/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Plus, User } from "lucide-react";

interface Technician {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export default function TechniciansPage() {
  const [techs, setTechs] = useState<Technician[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", employeeId: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/technicians").then((r) => r.json()).then(setTechs);

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.employeeId) { alert("Name and Employee ID required."); return; }
    setSaving(true);
    await fetch("/api/technicians", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm({ name: "", employeeId: "", email: "", phone: "" });
    setShowAdd(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
          <p className="text-sm text-gray-500 mt-1">{techs.length} active technicians</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add Technician
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Technician</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Employee ID *</label>
              <input className="form-input" placeholder="e.g. TECH-001" value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary" onClick={handleAdd} disabled={saving}>{saving ? "Saving…" : "Add Technician"}</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Technician</th>
              <th className="px-4 py-3 font-medium">Employee ID</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {techs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No technicians yet. Add the first one above.
                </td>
              </tr>
            )}
            {techs.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{t.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{t.employeeId}</td>
                <td className="px-4 py-3 text-gray-600">{t.email || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{t.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
