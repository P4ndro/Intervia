export default function PlaceholderChart() {
  // This is a placeholder for a real chart component
  // You can replace this with Chart.js, Recharts, or any other charting library
  
  const data = [65, 78, 85, 72, 90, 88, 82];
  const maxValue = Math.max(...data);
  
  return (
    <div className="w-full h-64 flex items-end justify-between gap-2">
      {data.map((value, index) => {
        const height = (value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-slate-700 rounded-t relative" style={{ height: `${height}%` }}>
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-t" style={{ height: '100%' }} />
            </div>
            <span className="text-xs text-slate-400 mt-2">Q{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

