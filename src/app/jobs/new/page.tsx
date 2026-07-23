// src/app/jobs/new/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreJob } from "@/lib/scoring";
import type { JobCategory, DeadlinePerformance, PartsUsed, FixAttempt, AcceptanceSpeed } from "@/lib/scoring";
import { ArrowLeft, Calculator } from "lucide-react";
import Link from "next/link";

interface Technician { id: string; name: string; employeeId: string; }

const EMPTY = {
  jobNumber: "",
  technicianId: "",
  category: "B" as JobCategory,
  description: "",
  assignedAt: new Date().toISOString().slice(0, 16),
  deadlineAt: "",
  completedAt: "",
  deadlinePerformance: "MET" as DeadlinePerformance,
  partsUsed: "MEDIUM" as PartsUsed,
  fixAttempt: "FIRST_TIME" as FixAttempt,
  acceptanceSpeed: "FAST" as AcceptanceSpeed,
  partsOrdered: 1,
  partsActuallyUsed: 1,
  isReopened: false,
  managerOverride: false,
  overridePoints: "",
  overrideReason: "",
};

export default function NewJobPage() {
  const router = useRouter();
  const [techs, setTechs] = useState<Technician[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ReturnType<typeof scoreJob> | null>(null);

  useEffect(() => {
    fetch("/api/technicians").then((r) => r.json()).then(setTechs);
  }, []);

  // Live score preview
  useEffect(() => {
    if (!form.technicianId) return;
    const s = scoreJob({
      category: form.category,
      deadlinePerformance: form.deadlinePerformance,
      partsUsed: form.partsUsed,
      fixAttempt: form.fixAttempt,
      acceptanceSpeed: form.acceptanceSpeed,
      partsOrdered: form.partsOrdered,
      partsActuallyUsed: form.partsActuallyUsed,
      isReopened: form.isReopened,
      jobsCompletedTodayBefore: 0, // simplified for preview
      managerOverride: form.managerOverride && form.overridePoints ? parseInt(form.overridePoints) : null,
    });
    setPreview(s);
  }, [form]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.jobNumber || !form.technicianId || !form.deadlineAt) {
      alert("Job #, Technician, and Deadline are required.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push("/jobs");
    else alert("Error saving job.");
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Job</h1>
          <p className="text-sm text-gray-500">Enter job details — points are calculated automatically</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main form */}
        <div className="col-span-2 space-y-5">
          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Job Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Job Number *</label>
                <input className="form-input" placeholder="e.g. JOB-2024-001" value={form.jobNumber} onChange={(e) => set("jobNumber", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Technician *</label>
                <select className="form-select" value={form.technicianId} onChange={(e) => set("technicianId", e.target.value)}>
                  <option value="">Select technician</option>
                  {techs.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Job Category *</label>
              <div className="grid grid-cols-3 gap-2">
                {(["A", "B", "C"] as JobCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set("category", cat)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      form.category === cat
                        ? cat === "A" ? "border-red-400 bg-red-50 text-red-700"
                          : cat === "B" ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                          : "border-green-400 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <p className="font-bold">Cat {cat}</p>
                    <p className="text-xs mt-0.5 font-normal">
                      {cat === "A" ? "High cost · 95 pts" : cat === "B" ? "Medium cost · 62 pts" : "Low cost · 38 pts"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief job description" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Assigned At *</label>
                <input type="datetime-local" className="form-input" value={form.assignedAt} onChange={(e) => set("assignedAt", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Deadline *</label>
                <input type="datetime-local" className="form-input" value={form.deadlineAt} onChange={(e) => set("deadlineAt", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Completed At</label>
                <input type="datetime-local" className="form-input" value={form.completedAt} onChange={(e) => set("completedAt", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Scoring parameters */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Scoring Parameters</h2>

            <div>
              <label className="form-label">Deadline Performance</label>
              <select className="form-select" value={form.deadlinePerformance} onChange={(e) => set("deadlinePerformance", e.target.value)}>
                <option value="MET">Met deadline</option>
                <option value="EARLY_30">30% early (bonus)</option>
                <option value="EARLY_50">50% early (bonus)</option>
                <option value="EARLY_70">70% early (bonus)</option>
                <option value="MISSED">Missed deadline (−pts)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Parts Used</label>
              <select className="form-select" value={form.partsUsed} onChange={(e) => set("partsUsed", e.target.value)}>
                <option value="LOW">Low cost parts (most points)</option>
                <option value="MEDIUM">Medium cost parts</option>
                <option value="HIGH">High cost parts (fewest pts)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Fix Attempt</label>
              <select className="form-select" value={form.fixAttempt} onChange={(e) => set("fixAttempt", e.target.value)}>
                <option value="FIRST_TIME">First time fix</option>
                <option value="REWORK_1">Rework — 1 revisit</option>
                <option value="REWORK_2">Rework 2 — 2nd revisit (0 pts)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Acceptance Speed</label>
              <select className="form-select" value={form.acceptanceSpeed} onChange={(e) => set("acceptanceSpeed", e.target.value)}>
                <option value="FAST">Fast — under 30 min (+10 pts)</option>
                <option value="MEDIUM">Medium — 30 min to 2 hrs (+5 pts)</option>
                <option value="SLOW">Slow — over 2 hrs or no response (0 pts)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Parts Ordered</label>
                <input type="number" min={0} className="form-input" value={form.partsOrdered} onChange={(e) => set("partsOrdered", Number(e.target.value))} />
              </div>
              <div>
                <label className="form-label">Parts Actually Used</label>
                <input type="number" min={0} className="form-input" value={form.partsActuallyUsed} onChange={(e) => set("partsActuallyUsed", Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="reopened" checked={form.isReopened} onChange={(e) => set("isReopened", e.target.checked)} className="w-4 h-4" />
              <label htmlFor="reopened" className="text-sm text-gray-700">Job reopened within 72 hours after closure (−15 pts)</label>
            </div>
          </div>

          {/* Manager override */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="override" checked={form.managerOverride} onChange={(e) => set("managerOverride", e.target.checked)} className="w-4 h-4" />
              <label htmlFor="override" className="text-sm font-medium text-gray-700">Manager override (set custom point total)</label>
            </div>
            {form.managerOverride && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Override Points</label>
                  <input type="number" className="form-input" value={form.overridePoints} onChange={(e) => set("overridePoints", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Reason</label>
                  <input className="form-input" placeholder="Document reason" value={form.overrideReason} onChange={(e) => set("overrideReason", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score preview */}
        <div>
          <div className="card p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Score Preview</h2>
            </div>
            {preview ? (
              <>
                <div className="text-center mb-4 pb-4 border-b border-gray-100">
                  <p className="text-4xl font-bold text-blue-700">{preview.totalJobPoints}</p>
                  <p className="text-xs text-gray-400 mt-1">points this job</p>
                </div>
                <div className="space-y-2">
                  {preview.breakdown.map((line, i) => (
                    <div key={i} className={`flex justify-between text-xs ${line.includes("−") ? "text-red-600" : "text-gray-600"}`}>
                      <span className="flex-1">{line.split(":")[0]}</span>
                      <span className="font-mono font-medium">{line.split(":")[1]?.trim()}</span>
                    </div>
                  ))}
                </div>
                {preview.rawTotal !== preview.totalJobPoints && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">Floor rule applied — job cannot go below 0</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a technician to see score preview</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving…" : "Save Job"}
        </button>
        <Link href="/jobs" className="btn-secondary">Cancel</Link>
      </div>
    </div>
  );
}
