// src/app/jobs/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

interface Job {
  id: string;
  jobNumber: string;
  category: string;
  description?: string;
  totalJobPoints: number;
  month: number;
  year: number;
  deadlinePerformance?: string;
  fixAttempt?: string;
  isReopened: boolean;
  managerOverride: boolean;
  technician: { name: string; employeeId: string };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function JobsPage() {
  const now = new Date();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    fetch(`/api/jobs?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then(setJobs);
  }, [month, year]);

  const filtered = jobs.filter(
    (j) =>
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.technician.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} jobs — {MONTHS[month - 1]} {year}</p>
        </div>
        <Link href="/jobs/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Search job # or technician"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select w-32" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-select w-24" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Job #</th>
              <th className="px-4 py-3 font-medium">Technician</th>
              <th className="px-4 py-3 font-medium">Cat</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Fix</th>
              <th className="px-4 py-3 font-medium">Flags</th>
              <th className="px-4 py-3 font-medium text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No jobs found. <Link href="/jobs/new" className="text-blue-600 hover:underline">Add the first job →</Link>
                </td>
              </tr>
            )}
            {filtered.map((job) => (
              <tr key={job.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-blue-700">{job.jobNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{job.technician.name}</p>
                  <p className="text-xs text-gray-400">{job.technician.employeeId}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-${job.category}`}>Cat {job.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{job.deadlinePerformance?.replace("_", " ") || "—"}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{job.fixAttempt?.replace("_", " ") || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {job.isReopened && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Reopened</span>}
                    {job.managerOverride && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Override</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                  {job.totalJobPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
