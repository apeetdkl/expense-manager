import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state
    const handleLogout = async () => {
        try {
            // 🔍 Force refresh the session before signing out
            await supabase.auth.refreshSession();
    
            // ✅ Fetch updated session data
            const { data: { session } } = await supabase.auth.getSession();
    
            if (!session) {
                console.warn("No active session found.");
                alert("You are already logged out.");
                navigate("/login");
                return;
            }
    
            // ✅ Proceed with logout
            const { error } = await supabase.auth.signOut();
            if (error) throw new Error(error.message);
    
            console.log("Successfully signed out");
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err.message);
            alert("Logout failed: " + err.message);
        }
    };
    return (
        <nav 
          className="fixed top-0 left-0 w-full text-white shadow-md z-50"
          style={{
            background: 'linear-gradient(to right, #09203f, #ae8b9c)',
            backgroundSize: '100% 100%',
            animation: 'gradientShift 10s ease infinite'
          }}
        >
          <div className="container mx-auto flex justify-between items-center p-4">
            {/* ✅ Brand Name */}
            <Link 
              to="/" 
              className="text-xl font-bold hover:text-gray-200 transition duration-300"
            >
              Expense Manager
            </Link>
            
            {/* ✅ Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden px-3 py-2 rounded-md text-white bg-gray-700/50 hover:bg-gray-600/50 transition"
            >
              ☰
            </button>
            
            {/* ✅ Navbar Items (Desktop View) */}
            <div className="hidden sm:flex items-center space-x-4">
             
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/70 rounded-md hover:bg-red-600/70 transition flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
          
          {/* ✅ Mobile Dropdown Menu */}
          {menuOpen && (
            <div 
              className="sm:hidden absolute top-full left-0 w-full"
              style={{
                background: 'linear-gradient(to right, #bdc3c7, #2c3e50)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 10s ease infinite'
              }}
            >
              <div className="flex flex-col items-center py-4 space-y-3">
               
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/70 rounded-md hover:bg-red-600/70 transition flex items-center space-x-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </nav>
      );
      }
      export default Navbar;