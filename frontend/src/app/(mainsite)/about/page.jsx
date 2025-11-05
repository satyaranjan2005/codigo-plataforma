


// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// const fadeInUp = {
//   hidden: { opacity: 0, y: 24 },
//   visible: (delay = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.7, ease: "easeOut", delay },
//   }),
// };

// export default function AboutUsPage() {
//   return (
//     <div className="bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
//       {/* Hero Section */}
//       <section
//         className="relative h-[80vh] flex flex-col justify-center items-center text-center text-white overflow-hidden"
//         style={{
//           backgroundImage: "url('/images/about-bg.jpg')", // replace with your image path
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* Dark Overlay */}
//         <div className="absolute inset-0 bg-black bg-opacity-45"></div>

//         {/* Animated Text Content */}
//         <motion.div
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.3 }}
//           className="relative z-10 px-6 max-w-3xl"
//         >
//           <motion.h1
//             custom={0}
//             variants={fadeInUp}
//             className="text-5xl sm:text-6xl font-extrabold tracking-tight uppercase drop-shadow-lg"
//           >
//             About Us
//           </motion.h1>

//           <motion.p
//             custom={0.15}
//             variants={fadeInUp}
//             className="mt-6 text-lg sm:text-xl text-gray-100 leading-relaxed"
//           >
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
//             eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
//             ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
//             aliquip.
//           </motion.p>
//         </motion.div>

//         {/* Slanted bottom divider */}
//         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
//           <svg
//             className="relative block w-[calc(100%+1.3px)] h-[70px]"
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="0 0 1200 120"
//             preserveAspectRatio="none"
//           >
//             <path
//               d="M0,0V46.29c47.79,22.25,106.74,29.16,158,17.39,70.22-15.86,136.21-57,207-63.77,76.25-7.29,147.89,27.46,224,35.39,88.74,9.3,175.67-17.11,263-29.39,58.84-8.41,118-6.11,175.9,7.47C1075.08,34.5,1137.54,51.13,1200,65V0Z"
//               opacity=".25"
//               className="fill-white"
//             ></path>
//           </svg>
//         </div>
//       </section>

//       {/* Content Section */}
//       <section className="max-w-7xl mx-auto px-6 py-16">
//         <div className="grid md:grid-cols-2 gap-10 items-center">
//           <motion.img
//             initial={{ opacity: 0, scale: 0.98 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.8 }}
//             viewport={{ once: true }}
//             src="/images/coding-class.jpg" // replace with actual image
//             alt="About Codigo"
//             className="rounded-2xl shadow-lg w-full object-cover h-80"
//           />

//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.3 }}
//             className="space-y-4"
//           >
//             <motion.h2 custom={0.05} variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-2">
//               Who We Are
//             </motion.h2>

//             <motion.p custom={0.15} variants={fadeInUp} className="text-slate-700 mb-2 leading-relaxed">
//               <strong>Codigo Plataforma</strong> is a student-led initiative at the{" "}
//               <span className="font-semibold">Silicon Institute of Technology, Sambalpur</span>. We organize coding
//               workshops, hackathons, and technical events to nurture creativity, teamwork, and real-world skills.
//             </motion.p>

//             <motion.p custom={0.25} variants={fadeInUp} className="text-slate-700 leading-relaxed">
//               Our mission is to bridge the gap between theory and practice by empowering students to learn through
//               hands-on experience and collaboration.
//             </motion.p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Mission Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 12 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//         viewport={{ once: true, amount: 0.3 }}
//         className="bg-white rounded-3xl shadow-xl p-10 max-w-6xl mx-auto mb-16"
//       >
//         <div className="md:flex justify-between items-center gap-8">
//           <div>
//             <h3 className="text-2xl font-semibold text-slate-900 mb-4">Our Mission</h3>
//             <p className="text-slate-700 leading-relaxed">
//               We believe in <strong>learning by doing</strong>. Our mission is to bridge the gap between knowledge and
//               application by fostering project-based learning, innovation, and teamwork.
//             </p>
//           </div>
//           <a
//             href="#events"
//             className="mt-6 md:mt-0 inline-block px-6 py-3 bg-slate-900 text-white rounded-md font-medium hover:opacity-90 transition-all"
//           >
//             See Upcoming Events
//           </a>
//         </div>
//       </motion.section>

//       {/* Contact Section */}
//       <section className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6 pb-20">
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="bg-white p-8 rounded-2xl shadow-md"
//         >
//           <h3 className="text-xl font-bold text-slate-900 mb-3">Join Us</h3>
//           <p className="text-slate-700 mb-4">
//             Passionate about coding, innovation, or technology? Become part of the Codigo community and grow with
//             like-minded peers.
//           </p>
//           <p className="text-sm text-slate-600">
//             Email: <span className="font-medium">codigo@sit.ac.in</span>
//           </p>
//         </motion.div>

//         {/* <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.08 }}
//           className="bg-white p-8 rounded-2xl shadow-md"
//         >
//           <h3 className="text-xl font-bold text-slate-900 mb-3">Partners & Sponsors</h3>
//           <p className="text-slate-700 mb-4">We collaborate with departments, clubs, and sponsors to organize impactful tech events and learning programs.</p>
//           <div className="h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-slate-400">
//             Sponsor Logos (Placeholder)
//           </div>
//         </motion.div> */}
//       </section>
//     </div>
//   );
// }


















"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay },
  }),
};

export default function AboutUsPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('/logo.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Blurred Background Overlay */}
        <div className="absolute inset-0 backdrop-blur-[10px] bg-white/40" />

        {/* Optional subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/70" />

        {/* Glassmorphism Text Box */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative z-10 px-8 py-10 max-w-3xl rounded-2xl bg-white/50 backdrop-blur-md shadow-xl border border-white/30"
        >
          <motion.h1
            custom={0}
            variants={fadeInUp}
            className="text-5xl sm:text-6xl font-extrabold tracking-tight uppercase text-slate-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]"
          >
            Codigo Plataforma
          </motion.h1>

          <motion.p
            custom={0.15}
            variants={fadeInUp}
            className="mt-6 text-lg sm:text-xl text-slate-800 font-semibold leading-relaxed drop-shadow-sm"
          >
            A student-driven technology community at the Silicon Institute of
            Technology, Sambalpur — we teach modern software skills, run
            hands-on workshops, and host competitive events that prepare
            students for real-world projects and careers.
          </motion.p>
        </motion.div>

        {/* Slanted bottom divider (inside hero section) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[70px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.25,106.74,29.16,158,17.39,70.22-15.86,136.21-57,207-63.77,76.25-7.29,147.89,27.46,224,35.39,88.74,9.3,175.67-17.11,263-29.39,58.84-8.41,118-6.11,175.9,7.47C1075.08,34.5,1137.54,51.13,1200,65V0Z"
              opacity=".25"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* Feature / Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            src="/logo.svg"
            alt="Codigo Plataforma — classes and events"
            className="rounded-2xl shadow-lg w-full object-cover h-80"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4"
          >
            <motion.h2 custom={0.05} variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-2">
              What We Do
            </motion.h2>

            <motion.p custom={0.15} variants={fadeInUp} className="text-slate-700 mb-2 leading-relaxed">
              Codigo Plataforma empowers students to build practical technical
              skills through structured learning, project work, and community
              collaboration. We focus on modern development practices, teamwork,
              and problem-solving.
            </motion.p>

            <motion.ul custom={0.25} variants={fadeInUp} className="list-disc pl-5 text-slate-700 space-y-2">
              <li><strong>Hands-on Workshops:</strong> Deep dives into web, mobile, ML and cloud technologies.</li>
              <li><strong>Project Labs:</strong> Mentor-driven projects that turn theory into deployable work.</li>
              <li><strong>Competitions & Hackathons:</strong> Real-world challenges that sharpen skills and teamwork.</li>
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* Feature cards section with image backgrounds */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {/* Structured Learning */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-lg group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/learning.jpg')" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-50 transition-all duration-300" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-64 text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Structured Learning</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Curated courses and study tracks that guide beginners to intermediate contributors through practical exercises.
            </p>
          </div>
        </motion.article>

        {/* Competitions & Events */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden shadow-lg group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/competition.jpg')" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-50 transition-all duration-300" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-64 text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Competitions & Events</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Regular hackathons, coding contests, and speaker sessions to build experience and network with peers.
            </p>
          </div>
        </motion.article>

        {/* Mentorship & Community */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden shadow-lg group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/community.jpg')" }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-50 transition-all duration-300" />
          <div className="relative z-10 p-8 flex flex-col justify-end h-64 text-white">
            <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">Mentorship & Community</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Peer mentorship, project reviews, and collaboration channels to accelerate learning and career readiness.
            </p>
          </div>
        </motion.article>
      </section>

      {/* Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true, amount: 0.3 }}
        className="bg-white rounded-3xl shadow-xl p-10 max-w-6xl mx-auto mb-16"
      >
        <div className="md:flex justify-between items-center gap-8">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              To bridge academic learning and industry practice by delivering project-led training, fostering collaboration, and creating a supportive environment where students can build portfolio-ready projects and professional skills.
            </p>
          </div>
          <a
            href="#events"
            className="mt-6 md:mt-0 inline-block px-6 py-3 bg-slate-900 text-white rounded-md font-medium hover:opacity-90 transition-all"
          >
            See Upcoming Events
          </a>
        </div>
      </motion.section>
    </div>
  );
}
