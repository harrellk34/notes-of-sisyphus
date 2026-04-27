export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
          Notes of Sisyphus
        </h1>
        <h2 className="text-xl md:text-2xl font-medium mb-8 text-gray-300">
          Track the grind. Build the body. Repeat.
        </h2>
        <p className="text-lg md:text-xl mb-12 text-gray-400 leading-relaxed">
          A simple system to log workouts, track nutrition, and stay consistent.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors duration-200">
            Get Started
          </button>
          <button className="bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors duration-200">
            View Progress
          </button>
        </div>
        <p className="mt-16 text-sm text-gray-500">
          Built for discipline.
        </p>
      </div>
    </div>
  );
}
