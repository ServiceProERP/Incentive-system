// src/app/guide/page.tsx
import { BookOpen, Info, ShieldCheck } from "lucide-react";

const DEADLINE_ROWS = [
  { tier: "Meet deadline", a: "+30", b: "+20", c: "+12" },
  { tier: "70% earlier — bonus on top", a: "+20", b: "+12", c: "+8" },
  { tier: "50% earlier — bonus on top", a: "+12", b: "+8", c: "+5" },
  { tier: "30% earlier — bonus on top", a: "+6", b: "+4", c: "+2" },
  { tier: "Miss deadline", a: "−20", b: "−12", c: "−6" },
];

const PARTS_ROWS = [
  { tier: "Low cost parts used", a: "+20", b: "+14", c: "+8" },
  { tier: "Medium cost parts used", a: "+12", b: "+8", c: "+4" },
  { tier: "High cost parts used", a: "+5", b: "+3", c: "+1" },
];

const FIX_ROWS = [
  { tier: "First time fix", a: "+25", b: "+16", c: "+10" },
  { tier: "Rework — 1 revisit", a: "+8", b: "+5", c: "+3" },
  { tier: "Rework 2 — 2nd revisit", a: "0", b: "0", c: "0" },
];

const EXTRA_ROWS = [
  { param: "Multiple jobs in a day", points: "+5 pts per extra job (after 3rd job/day)", logic: "Rewards volume and availability." },
  { param: "No unused parts returned", points: "+8 pts if parts ordered = parts used", logic: "Rewards accurate parts planning." },
  { param: "Job reopened after closure", points: "−15 pts if reopened within 72 hrs", logic: "Penalises false closures." },
  { param: "Job acceptance speed", points: "+10 (<30 min) · +5 (30 min–2 hrs) · 0 (>2 hrs)", logic: "Rewards fast job pickup." },
];

const TIER_ROWS = [
  { tier: "No incentive", range: "Below 200 pts", mult: "—", meaning: "Manager review triggered" },
  { tier: "Standard", range: "200 – 499 pts", mult: "1.0×", meaning: "Points × ₹ rate (base)" },
  { tier: "High performer", range: "500 – 799 pts", mult: "1.2×", meaning: "20% bonus on total incentive" },
  { tier: "Star performer", range: "800+ pts", mult: "1.5×", meaning: "50% bonus on total incentive" },
];

function TableCard({ title, rows }: { title: string; rows: { tier: string; a: string; b: string; c: string }[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-4 py-2 font-medium">Tier</th>
            <th className="px-4 py-2 font-medium text-right">Cat A</th>
            <th className="px-4 py-2 font-medium text-right">Cat B</th>
            <th className="px-4 py-2 font-medium text-right">Cat C</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tier} className="border-b border-gray-50 last:border-0">
              <td className="px-4 py-2 text-gray-700">{r.tier}</td>
              <td className={`px-4 py-2 text-right font-mono ${r.a.startsWith("−") ? "text-red-600" : "text-gray-800"}`}>{r.a}</td>
              <td className={`px-4 py-2 text-right font-mono ${r.b.startsWith("−") ? "text-red-600" : "text-gray-800"}`}>{r.b}</td>
              <td className={`px-4 py-2 text-right font-mono ${r.c.startsWith("−") ? "text-red-600" : "text-gray-800"}`}>{r.c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <BookOpen size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incentive Calculation Guide</h1>
          <p className="text-sm text-gray-500 mt-1">How a technician&apos;s ₹ payout is worked out, step by step</p>
        </div>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-3">How it works</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Every completed job earns points across three core parameters — deadline performance, parts
          efficiency, and fix attempt. Points build up over the month and convert into a ₹ incentive
          payout. The manager sets the ₹ rate per point on the{" "}
          <a href="/settings" className="text-blue-600 hover:underline">Settings</a> page, and gives
          final approval before it flows into payroll.
        </p>
      </div>

      {/* Job categories */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Job categories</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-red-200 bg-red-50">
            <p className="font-bold text-red-700">Category A · High cost</p>
            <p className="text-sm text-red-600 mt-1">Max 95 pts</p>
            <p className="text-xs text-gray-600 mt-2">Major breakdowns, capital equipment, complex industrial repairs.</p>
          </div>
          <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <p className="font-bold text-yellow-700">Category B · Medium cost</p>
            <p className="text-sm text-yellow-600 mt-1">Max 62 pts</p>
            <p className="text-xs text-gray-600 mt-2">Standard repairs, scheduled service, routine preventive maintenance.</p>
          </div>
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <p className="font-bold text-green-700">Category C · Low cost</p>
            <p className="text-sm text-green-600 mt-1">Max 38 pts</p>
            <p className="text-xs text-gray-600 mt-2">Minor repairs, inspections, consumable replacements, basic checks.</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Category is set by the manager/dispatcher at job assignment and reflects expected cost and
          complexity — not what parts were ultimately used.
        </p>
      </div>

      {/* Point tables */}
      <div className="space-y-5">
        <h2 className="font-semibold text-gray-800">Points reference table</h2>
        <TableCard title="1. Deadline performance" rows={DEADLINE_ROWS} />
        <TableCard title="2. Components used" rows={PARTS_ROWS} />
        <TableCard title="3. Fix attempt" rows={FIX_ROWS} />
      </div>

      {/* Notes */}
      <div className="card p-5 bg-blue-50 border-blue-100 flex gap-3">
        <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900 space-y-2">
          <p><strong>Parts scoring:</strong> lower cost parts earn more points because it signals efficient diagnosis. The job category stays fixed regardless of which parts were used.</p>
          <p><strong>Rework 2:</strong> a second revisit earns zero points — not a deduction. The zero is the penalty itself, so technicians aren&apos;t discouraged from returning to fix the issue properly.</p>
        </div>
      </div>

      {/* Additional parameters */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-sm">Additional auto-tracked parameters</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Parameter</th>
              <th className="px-4 py-2 font-medium">Points</th>
              <th className="px-4 py-2 font-medium">Logic</th>
            </tr>
          </thead>
          <tbody>
            {EXTRA_ROWS.map((r) => (
              <tr key={r.param} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2 font-medium text-gray-800">{r.param}</td>
                <td className="px-4 py-2 text-gray-600">{r.points}</td>
                <td className="px-4 py-2 text-gray-500 text-xs">{r.logic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Month-end */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Month-end: points → ₹ incentive</h2>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li><strong>Tally:</strong> Total points = Σ all job points − deductions for the month</li>
          <li><strong>Rate:</strong> Manager sets ₹ rate per point (e.g. ₹2 per point)</li>
          <li><strong>Payout:</strong> Incentive = Total points × ₹ rate × performance multiplier</li>
        </ol>
        <p className="text-sm text-gray-500 mt-3 italic">Example: 760 pts × ₹2 × 1.0 = ₹1,520 incentive</p>
      </div>

      {/* Tiers */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 text-sm">Performance multiplier tiers</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-4 py-2 font-medium">Tier</th>
              <th className="px-4 py-2 font-medium">Monthly points</th>
              <th className="px-4 py-2 font-medium">Multiplier</th>
              <th className="px-4 py-2 font-medium">What it means</th>
            </tr>
          </thead>
          <tbody>
            {TIER_ROWS.map((r) => (
              <tr key={r.tier} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2 font-medium text-gray-800">{r.tier}</td>
                <td className="px-4 py-2 text-gray-600">{r.range}</td>
                <td className="px-4 py-2 text-gray-600">{r.mult}</td>
                <td className="px-4 py-2 text-gray-500 text-xs">{r.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Guardrails */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-green-600" />
          <h2 className="font-semibold text-gray-800">Guardrails and rules</h2>
        </div>
        <ul className="text-sm text-gray-600 space-y-3">
          <li><strong className="text-gray-800">Floor rule:</strong> a single job can never go below 0 points. Deductions do not make a job&apos;s score negative.</li>
          <li><strong className="text-gray-800">Monthly deduction cap:</strong> total deductions in a month cannot exceed 30% of total gross points earned. A bad week cannot wipe out a good month.</li>
          <li><strong className="text-gray-800">No parts penalty:</strong> there is no deduction for using high cost parts — the scoring only rewards lower cost parts, never penalises a genuinely expensive repair.</li>
          <li><strong className="text-gray-800">Manager override:</strong> the manager can override any job&apos;s points with a documented reason — e.g. exceptional work on a difficult site, or a disputed client rating.</li>
          <li><strong className="text-gray-800">Approval before payout:</strong> the manager reviews and approves the monthly incentive statement before the approved amount flows into the payroll module.</li>
        </ul>
      </div>
    </div>
  );
}