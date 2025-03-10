import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // Close icon

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false); // Popup menu state
    const [user, setUser] = useState(null);

    // ✅ Fetch User Session on Component Mount
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw new Error(error.message);
            setUser(null); // Clear user state
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err.message);
            alert("Logout failed: " + err.message);
        }
    };

    return (
        <>
            {/* ✅ Navbar */}
            <nav 
                className="fixed top-0 left-0 w-full text-white shadow-md z-50"
                style={{
                    background: 'linear-gradient(to right, #09203f, #ae8b9c)',
                    backgroundSize: '100% 100%',
                    animation: 'gradientShift 10s ease infinite'
                }}
            >
                <div className="container mx-auto flex justify-between items-center p-4">
                <Link 
  to="/" 
  className="text-xl font-extrabold text-white tracking-wide 
             hover:text-gray-300 hover:scale-110 transition-transform duration-300 ease-in-out"
>
  Expense<span className="animate-pulse">-</span>Manager
</Link>
                    
                    {/* ✅ Quick Links (Desktop) */}
                    <div className="hidden sm:flex items-center space-x-6">
                        <Link to="/dashboard" className="hover:text-gray-300 transition"> Dashboard</Link>
                        <Link to="/expense-tracker" className="hover:text-gray-300 transition"> Group-Expenses</Link>
                        <Link to="/balances" className="hover:text-gray-300 transition"> Group-Balances</Link>
                        <Link to="/profile" className="hover:text-gray-300 transition">Update Profile</Link>
                      
                        {/* ✅ Logout Button */}
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-700 rounded-md transition flex items-center space-x-2"
                            >
                                <span></span>
                                <span>Logout</span>
                            </button>
                        )}
                    </div>

                    {/* ✅ Mobile Menu Toggle (Opens Popup) */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="sm:hidden px-3 py-2 rounded-md text-white bg-gray-700/50 hover:bg-gray-600/50 transition"
                    >
                        ☰
                    </button>
                </div>
            </nav>

            {/* ✅ Popup Full-Screen Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center text-white z-50"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* ✅ Close Button */}
                        <button 
                            onClick={() => setMenuOpen(false)}
                            className="absolute top-5 right-5 text-white text-3xl"
                        >
                            <X size={32} />
                        </button>

                        {/* ✅ Navigation Links */}
                        <div className="flex flex-col space-y-6 text-2xl">
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="hover:text-gray-300 transition">
                                📊 Dashboard
                            </Link>
                            <Link to="/expenses" onClick={() => setMenuOpen(false)} className="hover:text-gray-300 transition">
                                🧾 Group-Expenses
                            </Link>
                            <Link to="/balances" onClick={() => setMenuOpen(false)} className="hover:text-gray-300 transition">
                                💰 Group-Balances
                            </Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-gray-300 transition">
                                👤 Update Profile
                            </Link>

                            {/* ✅ Logout Button (Mobile) */}
                            {user && (
                                <motion.button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 transition text-lg flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Navbar;