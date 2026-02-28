export default function CTASection() {
  return (
    <section className="px-8 py-20 bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A] text-white">
      <div className="max-w-4xl mx-auto text-center bg-[#0E2F5A] p-16 rounded-3xl border border-blue-900">
        <h2 className="text-4xl font-bold mb-6 text-blue-400">
          Ready to transform your healthcare?
        </h2>
        <p className="text-blue-200 mb-8">
          Join the future of autonomous medicine management today.
          Secure, private, and always on.
        </p>
        <button className="bg-blue-500 hover:bg-blue-600 text-black px-8 py-4 rounded-xl font-semibold">
          Get Started Now
        </button>
      </div>
    </section>
  );
}