// src/app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Users, Briefcase, TrendingUp, IndianRupee, Star, Award, Zap } from "lucide-react";

interface DashboardData {
  month: number;
  year: number;
  totalTechs: number;
  totalJobs: number;
  totalPayout: number;
  totalPoints: number;
  topPerformers: Array<{
    id: string;
    netPoints: number;
    incentiveAmount: number;
    multiplierTier: string;
    technician: { name: string };
  }>;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TIER_ICON: Record<string, React.ReactNode> = {
  STAR_PERFORMER: <Star size={14} className="text-yellow-500" />,
  HIGH_PERFORMER: <Award size={14} className="text-blue-500" />,
  STANDARD: <Zap size={14} className="text-green-500" />,
};

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setData);
  }, [month, year]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Incentive overview — {MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex gap-2">
          <select
            className="form-select w-32"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="form-select w-24"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Technicians", value: data?.totalTechs ?? "—", icon: Users, color: "blue" },
          { label: "Jobs This Month", value: data?.totalJobs ?? "—", icon: Briefcase, color: "indigo" },
          { label: "Total Points", value: data?.totalPoints?.toLocaleString() ?? "—", icon: TrendingUp, color: "purple" },
          { label: "Total Payout", value: data ? `₹${data.totalPayout.toLocaleString()}` : "—", icon: IndianRupee, color: "green" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top performers */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Top Performers</h2>
        {!data?.topPerformers?.length ? (
          <p className="text-sm text-gray-400">No summaries yet. Run month-end computation in Month Payouts.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Technician</th>
                <th className="pb-2 font-medium">Tier</th>
                <th className="pb-2 font-medium text-right">Net Points</th>
                <th className="pb-2 font-medium text-right">Incentive</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformers.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-900">{p.technician.name}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-1">
                      {TIER_ICON[p.multiplierTier]}
                      <span className="text-gray-600">{p.multiplierTier.replace("_", " ")}</span>
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono">{p.netPoints.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold text-green-700">₹{p.incentiveAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
