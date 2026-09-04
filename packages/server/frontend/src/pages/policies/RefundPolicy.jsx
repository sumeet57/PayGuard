import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const RefundPolicy = () => {
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
          <h1 className="text-4xl text-orange-500 font-bold">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-400 mt-2">Last updated: August 23, 2026</p>
        </div>

        {/* DIGITAL */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            Digital Products & Code Packages
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Due to the nature of digital deliverables (source code, schematics, documentation, and research files), all sales are final once access links or Google Drive permissions are granted.
          </p>

          <p className="text-gray-400 mt-2">
            Exceptions apply strictly in cases of accidental duplicate purchases.
          </p>
        </div>

        {/* IOT */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            IoT & Hardware Builds
          </h2>

          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>No refunds are provided for physical damage or electrical faults caused by customer misuse.</li>
            <li>
              Every Labgineer physical hardware setup is fully stress-tested and inspected prior to dispatch or personal delivery.
            </li>
          </ul>
        </div>

        {/* CANCELLATION */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            Cancellation Policy
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Digital orders cannot be cancelled once payment is confirmed and files are delivered. Physical orders may be cancelled prior to dispatch if the destination area is unserviceable or if component stock is unavailable.
          </p>

          <p className="text-gray-400 mt-2">
            Cancellation requests must be submitted within 12 hours of purchase.
          </p>
        </div>

        {/* CONTACT */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">
            Support & Resolution
          </h2>

          <p className="text-gray-300 leading-relaxed">
            For questions or assistance with your order, email us at{" "}
            <a href="mailto:hello@labgineer.com" className="text-orange-400 hover:underline">
              hello@labgineer.com
            </a>{" "}
            /{" "}
            <a href="mailto:sumeet@labgineer.com" className="text-orange-400 hover:underline">
              sumeet@labgineer.com
            </a>{" "}
            or contact us directly at{" "}
            <a href="tel:+919321635813" className="text-orange-400 hover:underline">
              +91 93216 35813
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RefundPolicy;