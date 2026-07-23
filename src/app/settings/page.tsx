// src/app/settings/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, CheckCircle } from "lucide-react";

interface AppSettings {
  id: string;
  ratePerPoint: number;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [rate, setRate] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = () =>
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setSettings(s);
        setRate(String(s.ratePerPoint));
      });

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    const value = Number(rate);
    if (!value || value <= 0) {
      alert("Enter a valid ₹ rate per point (must be greater than 0).");
      return;
    }
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratePerPoint: value }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      load();
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert("Error saving settings.");
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <SettingsIcon size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Company-wide defaults for the incentive system</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-800 mb-1">Default ₹ Rate per Point</h2>
          <p className="text-sm text-gray-500 mb-4">
            Used as the starting rate on the Month Payouts screen each time you compute a new month.
            You can still override it per computation — this just sets the default so managers
            don&apos;t have to remember the current rate every month.
          </p>
          <div className="flex items-center gap-3 max-w-xs">
            <span className="text-lg text-gray-500">₹</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              className="form-input flex-1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span className="text-sm text-gray-400">/ pt</span>
          </div>
        </div>

        {settings && (
          <p className="text-xs text-gray-400">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button className="btn-primary flex items-center gap-2" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle size={15} /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="card p-6 mt-5">
        <h2 className="font-semibold text-gray-800 mb-2">Point values</h2>
        <p className="text-sm text-gray-500">
          Deadline, parts, fix-attempt, and bonus point values are fixed by the Servyn incentive
          framework and defined in <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">src/lib/scoring.ts</code>.
          See the <a href="/guide" className="text-blue-600 hover:underline">Incentive Guide</a> for
          the full breakdown, or edit that file directly to customise values for your company policy.
        </p>
      </div>
    </div>
  );
}