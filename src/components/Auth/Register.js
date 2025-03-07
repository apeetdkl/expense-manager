import React, { useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import { motion } from "framer-motion";

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [upi, setUpi] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // 🛠 State for validation errors
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        upi: "",
    });

    // 🛠 Validation functions
    const validateName = (value) => value.trim().length > 0;
    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validatePassword = (value) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
    const validatePhone = (value) => /^[0-9]{10}$/.test(value);
    const validateUpi = (value) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value);

    // 🛠 Handle validation on input change
    const handleInputChange = (setter, validator, field, value) => {
        setter(value);
        setErrors((prev) => ({
            ...prev,
            [field]: validator(value) ? "" : `Invalid ${field}`,
        }));
    };

    // ✅ Check if all fields are valid
    const isFormValid = () =>
        validateName(name) &&
        validateEmail(email) &&
        validatePassword(password) &&
        validatePhone(phone) &&
        validateUpi(upi);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setError("");
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: "http://localhost:3000/login",
                    shouldCreateUser: true,
                },
            });

            if (error) {
                setAuthError(error.message);
                return;
            }

            alert("✅ Check your email to confirm registration!");
            const user = data.user;
            if (!user) throw new Error("User registration failed.");

            const hashedPassword = await bcrypt.hash(password, 10);
            const profileData = { id: user.id, name, email, password: hashedPassword, phone, upi_id: upi };

            await supabase.from("profiles").upsert([profileData]);
            await supabase.from("users").upsert([{ id: user.id, name, email, phone }]);

            navigate("/login", { state: { message: "Registration successful! Please log in." } });
        } catch (err) {
            console.error("❌ Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
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
                <h2 className="text-3xl font-bold text-red-500 text-center mb-4">Register</h2>

                <form onSubmit={handleRegister} className="flex flex-col">
                    {/* Name Input */}
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => handleInputChange(setName, validateName, "name", e.target.value)}
                        className={`p-3 mb-3 rounded text-white focus:ring-2 w-full transition-all ${
                            errors.name ? "bg-red-900 border-red-500" : "bg-gray-700 border-green-500"
                        } border`}
                        required
                    />

                    {/* Email Input */}
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="email"
                        placeholder="Email for OTP Verification"
                        value={email}
                        onChange={(e) => handleInputChange(setEmail, validateEmail, "email", e.target.value)}
                        className={`p-3 mb-3 rounded text-white focus:ring-2 w-full transition-all ${
                            errors.email ? "bg-red-900 border-red-500" : "bg-gray-700 border-green-500"
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
                            onChange={(e) => handleInputChange(setPassword, validatePassword, "password", e.target.value)}
                            className={`p-3 mb-3 rounded w-full transition-all ${
                                errors.password ? "bg-red-900 border-red-500" : "bg-gray-700 border-green-500"
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

                    {/* Phone Input */}
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => handleInputChange(setPhone, validatePhone, "phone", e.target.value)}
                        className={`p-3 mb-3 rounded text-white focus:ring-2 w-full transition-all ${
                            errors.phone ? "bg-red-900 border-red-500" : "bg-gray-700 border-green-500"
                        } border`}
                        required
                    />

                    {/* UPI ID Input */}
                    <motion.input
                        whileFocus={{ scale: 1.05 }}
                        type="text"
                        placeholder="UPI ID"
                        value={upi}
                        onChange={(e) => handleInputChange(setUpi, validateUpi, "upi", e.target.value)}
                        className={`p-3 mb-3 rounded text-white focus:ring-2 w-full transition-all ${
                            errors.upi ? "bg-red-900 border-red-500" : "bg-gray-700 border-green-500"
                        } border`}
                        required
                    />

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

                    {/* Register Button (Hidden until all fields are valid) */}
                    {isFormValid() && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading}
                            className={`${
                                isLoading ? "bg-green-700" : "bg-green-500 hover:bg-green-600"
                            } text-white py-2 mt-4 rounded-lg font-semibold transition-all flex justify-center items-center shadow-lg`}
                        >
                            {isLoading ? "Processing..." : "Register"}
                        </motion.button>
                    )}
                </form>

                {/* Login Redirect */}
                <p className="text-gray-400 mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <motion.span 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate("/login")} 
                        className="text-green-400 hover:underline cursor-pointer"
                    >
                        Login
                    </motion.span>
                </p>
            </motion.div>
        </div>
    );
}

export default Register;