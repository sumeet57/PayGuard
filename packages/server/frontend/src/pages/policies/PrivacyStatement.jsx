import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const PrivacyStatement = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-neutral-950 text-white py-16 px-4 md:px-20">
      {/* NAV */}
      <div className="flex justify-between max-w-6xl mx-auto mb-10">
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

      <div className="max-w-5xl mx-auto bg-neutral-900/60 p-8 md:p-12 rounded-2xl border border-neutral-800 space-y-8">
        <div>
          <h1 className="text-4xl text-orange-500 font-bold">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: August 23, 2026</p>
        </div>

        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            Information We Collect
          </h2>
          <p className="text-gray-300 leading-relaxed">
            When you place an order, download project resources, or contact Labgineer, we collect personal information including your name, email address (e.g., sumeet@labgineer.com), phone number, and relevant shipping or delivery details.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            How We Use Information
          </h2>
          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>Process and fulfill project code, hardware builds, and digital orders</li>
            <li>Provide delivery updates and technical setup guidance</li>
            <li>Offer direct technical customer support via email or WhatsApp</li>
            <li>Improve Labgineer web tools, documentation, and platform security</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Payment Security</h2>
          <p className="text-gray-300 leading-relaxed">
            We do not store credit card numbers, UPI credentials, or financial account data on our servers. All monetary transactions are processed through encrypted payment gateway providers.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Data Protection & Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            We employ modern security standards to safeguard your information. We do not sell, rent, or trade your personal data to third parties.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Contact Information</h2>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions regarding this Privacy Policy or your data, reach out to us at{" "}
            <a href="mailto:hello@labgineer.com" className="text-orange-400 hover:underline">
              hello@labgineer.com
            </a>{" "}
            or call{" "}
            <a href="tel:+919321635813" className="text-orange-400 hover:underline">
              +91 93216 35813
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyStatement;