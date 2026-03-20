import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { locations, getDataForGranularity, weatherAttributes } from "../../data/placeholderData";

const COLORS = ["#0284c7", "#7c3aed", "#059669", "#dc2626"];

export default function LocationComparison({ granularity, selectedYear, selectedMonth }) {
  const [selectedIds, setSelectedIds] = useState(["melbourne", "sydney", "perth"]);

  const toggleLocation = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const comparisonData = useMemo(() => {
    const selected = locations.filter((l) => selectedIds.includes(l.id));
    return weatherAttributes.map((attr) => {
      const row = { attribute: attr.label };
      selected.forEach((loc) => {
        const data = getDataForGranularity(loc, granularity, selectedYear, selectedMonth);
        const avg = data.length
          ? +(data.reduce((s, d) => s + (d[attr.key] || 0), 0) / data.length).toFixed(1)
          : 0;
        row[loc.name] = avg;
      });
      return row;
    });
  }, [selectedIds, granularity, selectedYear, selectedMonth]);

  const selectedLocations = locations.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => toggleLocation(loc.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedIds.includes(loc.id)
                ? "bg-sky-100 text-sky-800 ring-1 ring-sky-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-pressed={selectedIds.includes(loc.id)}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {selectedLocations.length >= 2 ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="attribute" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {selectedLocations.map((loc, i) => (
              <Bar key={loc.id} dataKey={loc.name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} barSize={24} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
          Select at least 2 locations to compare
        </div>
      )}
    </div>
  );
}
