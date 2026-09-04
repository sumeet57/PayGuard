import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-neutral-950 text-white py-16 px-4 sm:px-6 md:px-20">
      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-xl text-black font-semibold hover:bg-orange-600 transition-colors"
        >
          <Home size={18} /> Home
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-2xl border border-neutral-800 p-8 space-y-8">
        <h1 className="text-4xl md:text-5xl text-orange-500 font-bold">
          Terms & Conditions
        </h1>

        <p className="text-gray-400">Last updated: February 11, 2026</p>

        {/* INTRO */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">1. Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            This website is owned and operated by{" "}
            <span className="text-white font-semibold">
              Sumeet Santosh Umbalkar
            </span>
            . We provide digital and physical final year academic projects
            strictly for educational and reference purposes.
          </p>
        </div>

        {/* IP */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">
            2. Intellectual Property & License
          </h2>

          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>All projects remain intellectual property of the owner.</li>
            <li>Purchase grants a non-transferable educational license.</li>
            <li>Resale, redistribution, or republishing is prohibited.</li>
            <li>
              Projects are meant for learning. We encourage students to build
              their own implementations.
            </li>
            <li>
              Users must comply with their institution’s academic integrity
              rules.
            </li>
          </ul>
        </div>

        {/* PRODUCTS */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">
            3. Products & Services
          </h2>

          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>
              <strong className="text-white">Digital Projects:</strong> Source code, documentation,
              diagrams, and blackbook (diagrams only) delivered via Google Drive
              access.
            </li>
            <li>
              <strong className="text-white">Physical IoT Projects:</strong> Fully assembled hardware
              models delivered in person.
            </li>
          </ul>
        </div>

        {/* DELIVERY */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">
            4. Payments, Shipping & Delivery
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Digital product access is granted after successful payment. Google
            Drive access is provided to the registered email ID.
          </p>

          <p className="text-gray-300 mt-3 leading-relaxed">
            Physical IoT projects are delivered within 4–5 working days,
            currently available within Mumbai at selected railway stations or
            meetup locations.
          </p>
        </div>

        {/* LIABILITY */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">
            5. Limitation of Liability
          </h2>

          <p className="text-gray-300 leading-relaxed">
            We are not responsible for academic grades, institutional approvals,
            or misuse of the project. All usage risk lies with the purchaser.
          </p>
        </div>

        {/* LAW */}
        <div>
          <h2 className="text-2xl text-orange-500 mb-2 font-semibold">6. Governing Law</h2>

          <p className="text-gray-300 leading-relaxed">
            These terms are governed by the laws of India. Any disputes fall
            under the jurisdiction of courts in Mumbai, Maharashtra.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditions;