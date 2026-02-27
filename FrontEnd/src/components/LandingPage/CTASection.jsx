export default function CTASection() {
  return (
    <section className="px-8 py-20 bg-[#061a17] text-white">
      <div className="max-w-4xl mx-auto text-center bg-[#0c2420] p-16 rounded-3xl border border-green-900">
        <h2 className="text-4xl font-bold mb-6">
          Ready to transform your healthcare?
        </h2>
        <p className="text-gray-400 mb-8">
          Join the future of autonomous medicine management today.
          Secure, private, and always on.
        </p>

        <button className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-xl font-semibold">
          Get Started Now
        </button>
      </div>
    </section>
  );
}