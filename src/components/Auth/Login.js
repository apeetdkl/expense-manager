import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login({ setSession }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [resetEmail, setResetEmail] = useState("");
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Validation functions
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validatePassword = (value) => value.length >= 6;

    const isFormValid = () => validateEmail(email) && validatePassword(password);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
        } else {
            setSession(data.session);
            navigate("/dashboard");
        }
    };

    

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-red-900 to-green-900">
            <motion.div 
                initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-black p-8 rounded-lg shadow-2xl max-w-sm w-full border-2 border-green-500"
            >
                <h2 className="text-3xl font-bold text-red-500 text-center mb-4">Login</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleLogin} className="flex flex-col">
                    {/* Email Input */}
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`p-3 mb-3 rounded text-white focus:ring-2 w-full transition-all ${
                            validateEmail(email) ? "bg-gray-800 border-green-500" : "bg-red-900 border-red-500"
                        } border`}
                        required
                    />

                    {/* Password Input */}
                    <motion.div className="relative">
                        <motion.input 
                            whileFocus={{ scale: 1.05 }}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`p-3 rounded w-full transition-all ${
                                validatePassword(password) ? "bg-gray-800 border-green-500" : "bg-red-900 border-red-500"
                            } border text-white focus:ring-2`}
                            required
                        />
                        <motion.button 
                            whileTap={{ scale: 0.9 }} 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword ? "👁️" : "🙈"}
                        </motion.button>
                    </motion.div>

                   

                    {/* Info Message */}
                    {!isFormValid() && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-red-400 text-sm text-center mt-2"
                        >
                            The button will only appear once all fields are filled validly.
                        </motion.p>
                    )}
                    <p
                    className="text-gray-400 text-center text-sm mt-4 cursor-pointer hover:underline"
                    onClick={() => navigate("/reset-password")}
                >
                    Forgot Password?
                </p>

                    {/* Login Button (Hidden until form is valid) */}
                    {isFormValid() && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white py-2 mt-4 rounded-lg font-semibold transition-all shadow-lg"
                        >
                            Login
                        </motion.button>
                    )}
                </form>

                {/* Register Link */}
                <p className="text-gray-400 mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <motion.span 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate("/register")} 
                        className="text-green-400 hover:underline cursor-pointer"
                    >
                        Register
                    </motion.span>
                </p>
            </motion.div>

        </div>
    );
}

export default Login;
