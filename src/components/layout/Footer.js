import React from "react";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

function Footer() {
  return (
    <footer className="relative bg-gradient-to-l from-[#ae8b9c] to-[#09203f] text-white py-8">
      
      {/* 🔹 Fancy Glowing Gradient Divider */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-red-700 to-blue-700 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        
        {/* 🔥 Brand Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold tracking-wide text-white">
            💰 Expense Manager
          </h2>
          <p className="text-gray-300 text-sm mt-2 max-w-sm">
            Your smart way to track expenses & settle group payments.
          </p>
        </div>

        {/* 🌐 Social Media */}
        <div className="flex justify-center space-x-6 mt-5">
          <a href="#" className="text-gray-400 hover:text-blue-600 transition">
            <Facebook size={22} />
          </a>
          <a href="#" className="text-gray-400 hover:text-black transition">
            <Twitter size={22} />
          </a>
          <a href="#" className="text-gray-400 hover:text-red-600 transition">
            <Instagram size={22} />
          </a>
          <a href="#" className="text-gray-400 hover:text-lime-500 transition">
            <Github size={22} />
          </a>
        </div>

        {/* ✅ Footer Bottom Section */}
        <div className="mt-8 border-t border-gray-500  pt-4 text-center text-xs text-zinc-100">
          © {new Date().getFullYear()} Expense Manager | All Rights Reserved
        </div>
      </div>
    </footer>
  );
}

export default Footer;