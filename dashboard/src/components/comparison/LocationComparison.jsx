import { useState, useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { locations, getDataForGranularity, weatherAttributes } from "../../data/placeholderData";

const COLORS = ["#0d1b2a", "#e76f51", "#2a9d8f", "#e9c46a"];

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
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedIds.includes(loc.id)
                ? "bg-[linear-gradient(135deg,rgba(231,111,81,0.18),rgba(244,132,95,0.24))] text-[#9b422d] ring-1 ring-[rgba(231,111,81,0.4)]"
                : "bg-[#f1e7dc] text-[#6e5d52] hover:bg-[#eadccd]"
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5d7c9" />
            <XAxis dataKey="attribute" tick={{ fontSize: 11, fill: "#5d4f45" }} axisLine={{ stroke: "#dccabb" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#8d7768" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{
                borderRadius: 14,
                border: "1px solid #e7b296",
                backgroundColor: "#fff8f1",
                fontSize: 12,
                boxShadow: "0 14px 28px rgba(61, 46, 33, 0.12)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#5d4f45" }} />
            {selectedLocations.map((loc, i) => (
              <Bar key={loc.id} dataKey={loc.name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} barSize={24} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#d8c8b8] bg-[#fbf4ed] text-sm text-[#8a7768]">
          Select at least 2 locations to compare
        </div>
      )}
    </div>
  );
}
