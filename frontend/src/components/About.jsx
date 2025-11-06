function About() {
  return (
    <section className="py-12 sm:py-14 md:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            About <span className="text-orange-500">Codigo Plataforma</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
            A student-led coding community focused on learning, building, and growing together through technology.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12">
          <div className="bg-white border-2 border-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">20+</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Active Members</div>
          </div>
          <div className="bg-white border-2 border-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">50+</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Projects Built</div>
          </div>
          <div className="bg-white border-2 border-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">100%</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">Student-Led</div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;

