export default function PrimaryButton({ children }) {
  return (
    <button
      type="submit"
      className="w-full py-3 rounded-lg bg-[#135C8C] hover:bg-[#0E4E75] transition-all text-white font-semibold mt-4"
    >
      {children}
    </button>
  );
}