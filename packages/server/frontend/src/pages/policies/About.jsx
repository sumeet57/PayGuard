import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Cpu, Code2, FlaskConical, Layers, BookOpen } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-neutral-950 text-white py-16 px-4 sm:px-6 md:px-20">
      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2 rounded-xl text-neutral-300 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-black font-semibold transition-colors"
        >
          <Home size={18} /> Home
        </button>
      </div>

      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-orange-500">
          About Labgineer
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
          At <span className="text-white font-semibold">Labgineer</span>, our mission is to bridge academic requirements with practical engineering. We provide <span className="text-white font-semibold">industry-ready final year projects</span> alongside a dedicated <span className="text-white font-semibold">R&D section</span> showcasing experimental prototypes, hardware architectures, and system designs.
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto mt-12">
        <div className="bg-neutral-900/60 backdrop-blur rounded-2xl p-8 border border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="text-orange-500" size={24} />
            <h2 className="text-2xl font-bold text-orange-500">What We Offer</h2>
          </div>

          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span> Fully tested IoT & Web projects
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span> Pre-assembled IoT kits with physical hardware delivery
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span> Instant digital code & resource access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span> Complete documentation, schematics, & blackbook reports
            </li>
            <li className="flex items-center gap-2">
              <span className="text-orange-500">•</span> Demo guidance & presentation prep
            </li>
          </ul>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur rounded-2xl p-8 border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <FlaskConical className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-orange-500">R&D Showcase</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Explore our active Research & Development showcase to see real-world experiments, custom microservice setups, embedded system design proofs, and experimental engineering builds before they become commercial packages.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-800">
            <div className="flex items-center gap-2 text-orange-500 font-semibold mb-2">
              <Cpu size={18} /> Stack & Hardware Focus
            </div>
            <p className="text-gray-400 text-sm">
              MERN Stack, Microservices, Docker, Redis, ESP32, ESP8266, Arduino Nano, Python, and Real-time WebSockets.
            </p>
          </div>
        </div>
      </div>

      {/* VISION */}
      <div className="text-center mt-16 max-w-2xl mx-auto bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800/80">
        <h3 className="text-3xl text-orange-500 font-bold mb-3">Our Vision</h3>

        <p className="text-gray-300 leading-relaxed">
          To make technical project development faster, accessible, and practical for every student and innovator — delivering reliable source code, hardware builds, and open R&D documentation under one roof.
        </p>
      </div>
    </section>
  );
};

export default About;