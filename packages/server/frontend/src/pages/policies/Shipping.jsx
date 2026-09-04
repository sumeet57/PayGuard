import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const Shipping = () => {
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
          <h1 className="text-4xl text-orange-500 font-bold">Shipping & Delivery Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: August 23, 2026</p>
        </div>

        {/* IOT */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">IoT & Hardware Projects</h2>

          <p className="text-gray-300 leading-relaxed">
            Physical IoT hardware builds and kits are dispatched and delivered within
            <span className="text-white font-semibold"> 4–5 working days</span> across supported service regions. Every unit undergoes strict hardware testing and is packed securely prior to shipment.
          </p>
        </div>

        {/* WEB */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Web Projects & Digital Assets</h2>

          <p className="text-gray-300 leading-relaxed">
            Digital software assets are delivered electronically. Google Drive access or download privileges are granted within 12 hours of order verification to your registered email address.
          </p>

          <ul className="list-disc ml-6 text-gray-400 mt-3 space-y-1">
            <li>Complete production source code</li>
            <li>Setup guides & architecture documentation</li>
            <li>Circuit & system schematics (if selected during checkout)</li>
            <li>Project report / Blackbook documentation (if selected during checkout)</li>
          </ul>
        </div>

        {/* NOTES */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Important Instructions</h2>

          <ul className="list-disc ml-6 text-gray-300 space-y-2">
            <li>Ensure you provide a valid email address during checkout to prevent access delays.</li>
            <li>Double-check physical shipping address details prior to order confirmation.</li>
            <li>Shipment tracking information will be emailed or made accessible directly inside your Labgineer account dashboard.</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h2 className="text-2xl text-orange-500 font-semibold mb-2">Questions Regarding Delivery?</h2>

          <p className="text-gray-300 leading-relaxed">
            For delivery status updates or address modification requests, contact support at{" "}
            <a href="mailto:hello@labgineer.com" className="text-orange-400 hover:underline">
              hello@labgineer.com
            </a>{" "}
            /{" "}
            <a href="mailto:sumeet@labgineer.com" className="text-orange-400 hover:underline">
              sumeet@labgineer.com
            </a>{" "}
            or reach out at{" "}
            <a href="tel:+919321635813" className="text-orange-400 hover:underline">
              +91 93216 35813
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Shipping;