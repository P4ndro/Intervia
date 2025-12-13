export default function TestimonialCard({ image, quote, name, role, company }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl text-gray-400">👤</span>
        )}
      </div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-600">{role} at {company}</p>
    </div>
  );
}

