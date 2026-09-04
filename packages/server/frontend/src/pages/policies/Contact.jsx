import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-neutral-950 text-white py-16 px-4 md:px-20">
      {/* NAV */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2 rounded-xl text-neutral-300 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl text-black font-semibold transition-colors"
        >
          <Home size={18} /> Home
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 text-center">
          Contact Us
        </h1>

        <p className="text-gray-300 text-center mt-4">
          Have a question about projects, delivery, or custom builds? Expect a
          response within 12–24 hours.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-12">
          <div className="bg-neutral-900/60 p-8 rounded-2xl border border-neutral-800">
            <h3 className="text-orange-500 font-semibold mb-2">General Support</h3>
            <a
              href="mailto:hello@labgineer.com"
              className="text-white hover:text-orange-400 transition-colors block"
            >
              hello@labgineer.com
            </a>

            <h3 className="text-orange-500 font-semibold mt-6 mb-2">Direct / Personal</h3>
            <a
              href="mailto:sumeet@labgineer.com"
              className="text-white hover:text-orange-400 transition-colors block"
            >
              sumeet@labgineer.com
            </a>

            <h3 className="text-orange-500 font-semibold mt-6 mb-2">Phone / WhatsApp</h3>
            <a
              href="tel:+919321635813"
              className="text-white hover:text-orange-400 transition-colors block"
            >
              +91 93216 35813
            </a>
            <p className="text-sm text-gray-400 mt-1">
              Mon – Sun, 11 AM – 8 PM (IST)
            </p>
          </div>

          <div className="bg-neutral-900/60 p-8 rounded-2xl border border-neutral-800">
            <h3 className="text-orange-500 font-semibold mb-4">Business Information</h3>

            <p className="text-neutral-300">
              <strong className="text-white">Brand Name:</strong>
              <br />
              Labgineer
            </p>

            <p className="text-neutral-300 mt-4">
              <strong className="text-white">Legal Entity Name:</strong>
              <br />
              Sumeet Santosh Umbalkar
            </p>

            <p className="text-neutral-300 mt-4">
              <strong className="text-white">Operating Address:</strong>
              <br />
              Mumbai, Maharashtra, India
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;