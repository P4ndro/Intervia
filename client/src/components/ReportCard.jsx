export default function ReportCard({ title, value, description }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-emerald-400 mb-2">{value}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

