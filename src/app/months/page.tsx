// src/app/months/page.tsx
"use client";
import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Star, Award, Zap, AlertTriangle } from "lucide-react";

interface Summary {
  id: string;
  month: number;
  year: number;
  totalJobsDone: number;
  grossPoints: number;
  totalDeductions: number;
  netPoints: number;
  multiplierTier: string;
  multiplier: number;
  ratePerPoint: number;
  incentiveAmount: number;
  isApproved: boolean;
  approvedBy?: string;
  technician: { name: string; employeeId: string };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TIER_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  STAR_PERFORMER:  { label: "Star Performer",  color: "yellow", icon: <Star size={14} /> },
  HIGH_PERFORMER:  { label: "High Performer",  color: "blue",   icon: <Award size={14} /> },
  STANDARD:        { label: "Standard",         color: "green",  icon: <Zap size={14} /> },
  NO_INCENTIVE:    { label: "Below Threshold",  color: "gray",   icon: <AlertTriangle size={14} /> },
};

export default function MonthsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rate, setRate] = useState(2.0);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [computing, setComputing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approver, setApprover] = useState("");

  const load = () =>
    fetch(`/api/months?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setSummaries);

  useEffect(() => { load(); }, [month, year]);

  const compute = async () => {
    setComputing(true);
    await fetch("/api/months", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, ratePerPoint: rate }),
    });
    setComputing(false);
    load();
  };

  const approve = async (id: string) => {
    if (!approver) { alert("Enter approver name"); return; }
    await fetch(`/api/months/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy: approver }),
    });
    setApprovingId(null);
    load();
  };

  const totalPayout = summaries.reduce((s, r) => s + r.incentiveAmount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Month Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">{MONTHS[month - 1]} {year} — Total: ₹{totalPayout.toLocaleString()}</p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="form-select w-28" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-select w-24" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">₹</span>
            <input
              type="number"
              step="0.5"
              className="form-input w-20"
              title="Rate per point"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <span className="text-xs text-gray-400">/pt</span>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={compute} disabled={computing}>
            <RefreshCw size={14} className={computing ? "animate-spin" : ""} />
            {computing ? "Computing…" : "Compute"}
          </button>
        </div>
      </div>

      {/* Approver row */}
      {summaries.some((s) => !s.isApproved) && (
        <div className="card p-4 mb-5 flex items-center gap-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800 font-medium">Pending approval</p>
          <input
            className="form-input w-48"
            placeholder="Approver name"
            value={approver}
            onChange={(e) => setApprover(e.target.value)}
          />
          <p className="text-xs text-amber-600">Enter your name, then click Approve on each row</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Technician</th>
              <th className="px-4 py-3 font-medium text-center">Jobs</th>
              <th className="px-4 py-3 font-medium text-right">Gross Pts</th>
              <th className="px-4 py-3 font-medium text-right">Deductions</th>
              <th className="px-4 py-3 font-medium text-right">Net Pts</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium text-right">Multiplier</th>
              <th className="px-4 py-3 font-medium text-right">Incentive</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {summaries.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No summaries yet. Click <strong>Compute</strong> to calculate month-end points.
                </td>
              </tr>
            )}
            {summaries.map((s) => {
              const tier = TIER_META[s.multiplierTier] || TIER_META.STANDARD;
              return (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.technician.name}</p>
                    <p className="text-xs text-gray-400">{s.technician.employeeId}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{s.totalJobsDone}</td>
                  <td className="px-4 py-3 text-right font-mono">{s.grossPoints}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600">
                    {s.totalDeductions > 0 ? `−${s.totalDeductions}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{s.netPoints}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-${tier.color}-100 text-${tier.color}-700`}>
                      {tier.icon} {tier.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{s.multiplier > 0 ? `${s.multiplier}×` : "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {s.incentiveAmount > 0 ? `₹${s.incentiveAmount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {s.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle size={12} /> Approved
                        {s.approvedBy && <span className="text-gray-400">by {s.approvedBy}</span>}
                      </span>
                    ) : approvingId === s.id ? (
                      <div className="flex gap-1">
                        <button className="btn-primary text-xs py-1 px-2" onClick={() => approve(s.id)}>Confirm</button>
                        <button className="btn-secondary text-xs py-1 px-2" onClick={() => setApprovingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => setApprovingId(s.id)}
                      >
                        Approve →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {summaries.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr className="font-semibold text-gray-700">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-center">{summaries.reduce((s, r) => s + r.totalJobsDone, 0)}</td>
                <td className="px-4 py-3 text-right font-mono">{summaries.reduce((s, r) => s + r.grossPoints, 0)}</td>
                <td className="px-4 py-3 text-right font-mono text-red-600">—</td>
                <td className="px-4 py-3 text-right font-mono">{summaries.reduce((s, r) => s + r.netPoints, 0)}</td>
                <td colSpan={2} />
                <td className="px-4 py-3 text-right text-green-700">₹{totalPayout.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
