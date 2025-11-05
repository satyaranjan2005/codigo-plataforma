import React from "react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
            About Codigo Plataforma
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-700 leading-relaxed">
            <strong>Codigo Plataforma</strong> is a student-led initiative of
            the{" "}
            <span className="font-semibold">
              Silicon Institute of Technology, Sambalpur
            </span>. We run coding classes, hands-on workshops, and host
            technology-driven competitions to empower students in developing
            technical skills, creativity, and teamwork.
          </p>
        </header>

        {/* Feature cards / image placeholders */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <article className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-slate-400 text-lg">
              Image Placeholder — Classes
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Coding Classes
              </h3>
              <p className="text-slate-600 text-sm">
                Engaging coding sessions and interactive workshops designed to
                strengthen your programming fundamentals and explore new tech
                domains.
              </p>
            </div>
          </article>

          <article className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-slate-400 text-lg">
              Image Placeholder — Competitions
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Tech Competitions
              </h3>
              <p className="text-slate-600 text-sm">
                From hackathons to coding contests, we promote healthy
                competition that encourages collaboration and creativity among
                students.
              </p>
            </div>
          </article>

          <article className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-slate-400 text-lg">
              Image Placeholder — Community
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Community & Growth
              </h3>
              <p className="text-slate-600 text-sm">
                We provide mentorship, networking, and peer-learning
                opportunities to help members grow both technically and
                professionally.
              </p>
            </div>
          </article>
        </section>

        {/* Mission / CTA section */}
        <section className="bg-white shadow rounded-2xl p-8 mb-12">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                Our Mission
              </h2>
              <p className="text-slate-700">
                We believe in <strong>learning by doing</strong>. Our mission is
                to bridge the gap between theoretical knowledge and practical
                application by encouraging project-based learning, innovation,
                and teamwork.
              </p>
            </div>

            <div className="mt-6 md:mt-0 flex-shrink-0">
              <a
                href="#events"
                className="inline-block px-5 py-3 rounded-md bg-slate-900 text-white text-sm font-medium hover:opacity-95 transition-all duration-200"
              >
                See upcoming events
              </a>
            </div>
          </div>
        </section>

        {/* Contact and partnership section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Join Us
            </h3>
            <p className="text-slate-700 mb-4">
              Interested in being part of Codigo Plataforma? We welcome all
              passionate students, volunteers, and innovators. Let’s learn and
              grow together.
            </p>
            <p className="text-sm text-slate-600">
              Email:{" "}
              <span className="font-medium">codigo@sit.ac.in</span> (placeholder)
            </p>
          </div>

          <div className="bg-white shadow rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Partners & Sponsors
            </h3>
            <p className="text-slate-700 mb-4">
              We collaborate with college departments, clubs, and sponsors to
              conduct impactful events and workshops.
            </p>
            <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-slate-400">
              Sponsor / Partner Logos (placeholder)
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
