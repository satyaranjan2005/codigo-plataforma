function Events() {
  const events = [
    {
      date: "15",
      month: "NOV",
      year: "2024",
      title: "Web Development Workshop",
      description: "Learn modern web technologies with hands-on projects",
      category: "Workshop",
      attendees: 45,
      time: "6:00 PM - 8:00 PM",
      location: "Lab 301"
    },
    {
      date: "22",
      month: "NOV",
      year: "2024",
      title: "Hackathon 2024",
      description: "24-hour coding challenge with exciting prizes",
      category: "Competition",
      attendees: 120,
      time: "9:00 AM - Next Day",
      location: "Main Auditorium"
    },
    {
      date: "30",
      month: "NOV",
      year: "2024",
      title: "AI & Machine Learning Talk",
      description: "Guest speaker from industry sharing insights",
      category: "Seminar",
      attendees: 80,
      time: "5:00 PM - 7:00 PM",
      location: "Seminar Hall"
    },
    {
      date: "08",
      month: "DEC",
      year: "2024",
      title: "Project Showcase",
      description: "Present your innovative projects to the community",
      category: "Exhibition",
      attendees: 60,
      time: "3:00 PM - 6:00 PM",
      location: "Exhibition Center"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Upcoming <span className="text-orange-500">Events</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join us for workshops, hackathons, and networking events designed to enhance your coding skills
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-orange-500 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="p-6">
                {/* Top Section */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Date Box */}
                  <div className="bg-orange-500 text-white rounded-xl p-4 min-w-20 text-center shrink-0">
                    <div className="text-3xl font-bold leading-none">{event.date}</div>
                    <div className="text-sm font-semibold uppercase mt-1">{event.month}</div>
                  </div>

                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        {event.attendees} attending
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-500 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-orange-500 font-semibold text-sm group-hover:gap-3 transition-all">
                    <span>Register</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 hover:shadow-lg transition-all duration-300">
            View All Events
          </button>
        </div>
      </div>
    </section>
  );
}

export default Events;