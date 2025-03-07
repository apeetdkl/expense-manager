import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; 



function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: "User" });
    const [userId, setUserId] = useState(null);
    const [balance, setBalance] = useState(null);
    const [newBalance, setNewBalance] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                navigate("/login"); // Redirect if not logged in
                return;
            }

            const userId = data.session.user.id;
            setUserId(userId);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", userId)
                .single();

            if (!profileError) setUser(profile);

            fetchBalance(userId);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUserId(session.user.id);
                fetchBalance(session.user.id);
            } else {
                navigate("/login");
            }
        });

        setLoading(false);

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]);

    const fetchBalance = async (userId) => {
        const { data, error } = await supabase
            .from("balance")
            .select("total_money")
            .eq("user_id", userId)
            .single();

        if (!error) {
            setBalance(data?.total_money || 0);
        }
    };

    const handleAddBalance = async () => {
        if (!newBalance || isNaN(newBalance)) return;

        const updatedBalance = balance + parseFloat(newBalance);

        const { error } = await supabase
            .from("balance")
            .upsert([{ user_id: userId, total_money: updatedBalance }], { onConflict: ["user_id"] });

        if (!error) {
            setBalance(updatedBalance);
            setNewBalance("");
        }
    };
    // Handle expense addition (updates balance dynamically)
    const handleExpenseAdded = async (amount) => {
        const newBalance = balance - amount;
        setBalance(newBalance);

        await supabase
            .from("balance")
            .update({ total_money: newBalance })
            .eq("user_id", userId);
    };

    // Handle expense deletion (updates balance dynamically)
    const handleExpenseDeleted = async (amount) => {
        const newBalance = balance + amount;
        setBalance(newBalance);

        await supabase
            .from("balance")
            .update({ total_money: newBalance })
            .eq("user_id", userId);
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-lg text-green-400 animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-l from-[#ae8b9c] to-[#09203f] text-white">
            
            {/* ✅ Welcome Message */}
            <motion.h1 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-6 text-center"
            >
                Welcome, {user?.name || "User"}! 👋
            </motion.h1>

            {/* ✅ Responsive Layout (Stack on Mobile, Grid on Larger Screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                
                {/* ✅ Enter Amount Input */}
                <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-green-400 flex flex-col items-center">
                    <motion.input 
                        whileFocus={{ scale: 1.05 }}
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="💰 Enter Amount"
                        className="w-full p-3 bg-gray-700 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                    />
                </div>

                {/* ✅ Balance Display */}
                <div className="bg-gradient-to-l from-red-600 via-red-500 to-red-700 px-6 py-3 rounded-lg text-white font-bold shadow-lg flex items-center justify-center">
                    📊 Balance: ₹{balance} 
                </div>

                {/* ✅ Add Personal Money */}
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddBalance}
                    className="bg-gray-900 p-6 rounded-lg shadow-lg border border-blue-400 text-lg flex justify-center items-center w-full"
                >
                    🏦 Add Personal Money
                </motion.button>

                {/* ✅ Edit Profile (Now Same Style as Other Buttons) */}
                <Link to="/profile" className="w-full">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-900 p-6 rounded-lg shadow-lg border border-purple-400 text-lg flex justify-center items-center w-full"
                    >
                        ✏️ Edit Profile
                    </motion.button>
                </Link>
            </div>

            {/* ✅ Add Expense (Full-width button on all screens) */}
            <Link to="/expenses" className="w-full max-w-3xl">
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 bg-gray-900 p-6 rounded-lg shadow-lg border border-red-400 text-lg flex justify-center items-center w-full"
                >
                    🧾 Add Expense
                </motion.button>
            </Link>

        </div>
    );
}

export default Dashboard;       