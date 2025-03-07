import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabaseClient";

function ResetPassword() {
    const [step, setStep] = useState(1); // 1: Request Reset, 2: Reset Password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
 const [showPassword, setShowPassword] = useState(false);
    // ✅ Check if the user is redirected with a session (Supabase handles this)
    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setStep(2); // Move to password reset step
            }
        };
        checkUserSession();
    }, []);

    // ✅ 1. Send Password Reset Email
    const requestPasswordReset = async () => {
        setError("");
        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:3000/reset-password",
        });

        if (error) {
            setError(error.message);
        } else {
            alert("✅ Reset link sent! Check your email.");
        }
    };

    // ✅ 2. Reset Password after clicking email link
    const resetPassword = async () => {
        setError("");
    
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    
        const { error } = await supabase.auth.updateUser({ password });
    
        if (error) {
            setError(error.message);
        } else {
            // ✅ Sign out the user after password reset
            await supabase.auth.signOut();
            
            setSuccess(true);
            alert("✅ Password updated! Please log in again.");
            navigate("/login"); // Redirect to login page
        }
    };

    return (
        <div className="flex w-full justify-center items-center min-h-screen bg-gradient-to-br from-black via-red-900 to-green-900">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-black p-8 rounded-lg shadow-2xl max-w-sm w-full border-2 border-green-500"
            >
                <h2 className="text-3xl font-bold text-red-500 text-center mb-4">
                    {step === 1 ? "Request Password Reset" : "Reset Password"}
                </h2>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* ✅ Step 1: Request Password Reset */}
                {step === 1 && (
                    <>
                        <motion.input
                            whileFocus={{ scale: 1.05 }}
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 mt-3 bg-gray-800 border border-green-500 text-white rounded"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={requestPasswordReset}
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg w-full"
                        >
                            Send Reset Link
                        </motion.button>
                    </>
                )}

                {/* ✅ Step 2: Reset Password */}
                {/* ✅ Step 2: Reset Password */}
                {step === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); resetPassword(); }} className="flex flex-col">
                        
                        {/* ✅ New Password Field */}
                        <div className="relative w-full">
                            <motion.input
                                whileFocus={{ scale: 1.05 }}
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 mt-3 bg-gray-800 border border-green-500 text-white rounded"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>

                        {/* ✅ Confirm Password Field */}
                        <div className="relative w-full">
                            <motion.input
                                whileFocus={{ scale: 1.05 }}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 mt-3 bg-gray-800 border border-green-500 text-white rounded"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg w-full"
                        >
                            Update Password
                        </motion.button>
                    </form>
                )}

                {success && <p className="text-green-500 text-sm text-center mt-2">✅ Password updated! Redirecting...</p>}

                <p className="text-gray-400 text-center text-sm mt-4 cursor-pointer hover:underline" onClick={() => navigate("/login")}>
                    Back to Login
                </p>
            </motion.div>
        </div>
    );
}

export default ResetPassword;