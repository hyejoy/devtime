export default function LoadingBar() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="border-brand-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      <p className="mt-4 font-medium text-gray-600">Loading...</p>
    </div>
  );
}
