export default function ReportCard({ title, value, description }) {
  return (
    <div className="bg-black rounded-lg shadow-xl p-6 border border-white">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className="text-sm text-white">{description}</p>
    </div>
  );
}

