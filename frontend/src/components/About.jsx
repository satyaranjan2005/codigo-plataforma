function About() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            About <span className="text-orange-500">Codigo Platforma</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A student-led coding community focused on learning, building, and growing together through technology.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">20+</div>
            <div className="text-sm text-slate-600 font-medium">Active Members</div>
          </div>
          <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">50+</div>
            <div className="text-sm text-slate-600 font-medium">Projects Built</div>
          </div>
          <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
            <div className="text-sm text-slate-600 font-medium">Student-Led</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-300">
            Join Us
          </button>
        </div>
      </div>
    </section>
  );
}

export default About;

