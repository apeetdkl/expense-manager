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
            setLoading(true); // Start loading
    
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                navigate("/login"); 
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
    
            await fetchBalance(userId);
    
            // ⏳ Ensure at least 2 seconds loading time
            setTimeout(() => {
                setLoading(false);
            }, 2000);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                {/* 🔄 Animated Loader */}
                <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    
                {/* ✨ Loading Text */}
                <p className="text-xl font-semibold text-green-400 animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }
    
  
        return (
            
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-l from-[#ae8b9c] to-[#09203f] text-white pt-32">
                
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
                    


                     {/* ✅ Balance Display */}
                     <div className="bg-gradient-to-l from-red-600 via-red-500 to-red-700 px-6 py-3 rounded-lg text-white font-extrabold shadow-lg flex items-center justify-center text-l">
                        📊 Remaining Balance : ₹{balance} 
                    </div>



                    {/* ✅ Enter Amount Input */}
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-green-400 flex flex-col items-center">
                        <motion.input 
                            whileFocus={{ scale: 1.05 }}
                            type="number"
                            value={newBalance}
                            onChange={(e) => setNewBalance(e.target.value)}
                            placeholder="Enter Amount & Click Add Balance"
                            className="w-full p-3 bg-gray-700 text-white border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                        />
                    </div>
    
                   
    
                    {/* ✅ Add Personal Money */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddBalance}
                        className="bg-gray-900 p-6 rounded-lg shadow-lg border border-blue-400 text-lg flex justify-center items-center w-full"
                    >
                        🏦 Add Balance
                    </motion.button>
    
                    {/* ✅ Edit Profile */}
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
    
                {/* ✅ Add Expense (Full-width button) */}
                <Link to="/expenses" className="w-full max-w-3xl">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 bg-gray-900 p-6 rounded-lg shadow-lg border border-red-400 text-lg flex justify-center items-center w-full"
                    >
                        🧾 Add Personal Expense
                    </motion.button>
                </Link>
    
                {/* ✅ Group Expense (New Button) */}
                <Link to="/expense-tracker" className="w-full max-w-3xl">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 bg-gray-900 p-6 rounded-lg shadow-lg border border-yellow-400 text-lg flex justify-center items-center w-full"
                    >
                        📌 Add Group Expense
                    </motion.button>
                </Link>
    
                {/* ✅ Group Balance (New Button) */}
                <Link to="/balances" className="w-full max-w-3xl">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 bg-gray-900 p-6 rounded-lg shadow-lg border border-green-400 text-lg flex justify-center items-center w-full"
                    >
                        📊 View Group Balance
                    </motion.button>
                </Link>
    
            </div>
           
        );
    }
    
    export default Dashboard;    