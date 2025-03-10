import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [upi, setUpi] = useState("");
    const [profilePicURL, setProfilePicURL] = useState("https://via.placeholder.com/150");
    const [loading, setLoading] = useState(true);
    const [qrCodeURL, setQrCodeURL] = useState(""); 

    useEffect(() => {
        const fetchUser = async () => {

            setLoading(true); // Start loading
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData?.session) {
                navigate("/login");
                return;
            }

            const userId = sessionData.session.user.id;
            setUser(sessionData.session.user);
            setEmail(sessionData.session.user.email);

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("❌ Error fetching profile:", error);
                return;
            }

            if (data) {
                setName(data.name || "");
                setPhone(data.phone || "");
                setUpi(data.upi_id || "");
                setProfilePicURL(data.profile_image || "https://via.placeholder.com/150");
            }

            // ⏳ Ensure at least 2 seconds loading time
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };
        fetchUser();
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;
    
        // Update in 'users' table
        const { error: userError } = await supabase
            .from("users")
            .update({ name, phone})
            .eq("id", user.id);
    
        // Update in 'profiles' table
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ name, phone, upi_id: upi })
            .eq("id", user.id);
    
        if (userError || profileError) {
            alert("❌ Error updating profile: " + (userError?.message || profileError?.message));
        } else {
            alert("✅ Profile updated successfully in both tables!");
        }
    };

    const handleQRUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user) return;
    
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}_qr.${fileExt}`;
        const filePath = `qr_codes/${fileName}`;
    
        // Fetch existing QR code before updating
        const { data: qrData, error: fetchError } = await supabase
            .from("profiles")
            .select("payment_qr")
            .eq("id", user.id)
            .single();
    
        if (fetchError) {
            console.error("❌ Error fetching existing QR:", fetchError);
        }
    
        const oldQrURL = qrData?.payment_qr;
    
        // Upload new QR code to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from("payment_qrs")
            .upload(filePath, file, { upsert: true });
    
        if (uploadError) {
            alert("❌ Error uploading QR code: " + uploadError.message);
            return;
        }
    
        // Get public URL of the uploaded QR code
        const { data: publicUrlData } = supabase.storage
            .from("payment_qrs")
            .getPublicUrl(filePath);
    
        const publicURL = publicUrlData.publicUrl;
    
        // Update QR code URL in Supabase database
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ payment_qr: publicURL })
            .eq("id", user.id);
    
        if (updateError) {
            alert("❌ Error saving QR code: " + updateError.message);
            return;
        }
    
       
    
        setQrCodeURL(publicURL);
        alert("✅ QR Code updated!");
    };
   
    
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                {/* 🔄 Animated Loader */}
                <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>

                {/* ✨ Loading Text */}
                <p className="text-xl font-semibold text-green-400 animate-pulse">
                    Loading Profile...
                </p>
            </div>
        );
    }


    return (
      
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6 pt-28">
            <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-lg text-white">
                <h2 className="text-3xl font-bold text-center mb-6 text-green-400">Profile</h2>
                <div className="flex flex-col items-center">
                    {/* Profile Image */}
                  {/* QR Code Image Preview */}
            <div className="relative w-40 h-40 mb-4">
                <img
                    src={qrCodeURL || "https://via.placeholder.com/150"} // Default placeholder if no QR
                    alt="Your Payment QR"
                    className="w-full h-full rounded-lg object-cover border-4 border-green-400 shadow-lg"
                />
            </div>

            {/* Upload Button */}
            <label className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-600 transition font-semibold mb-6">
                📤 Upload Your Paytm QR
                <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
            </label>

                    {/* Profile Form */}
                    <form onSubmit={handleUpdate} className="w-full">
                        <div className="mb-4">
                            <label className="block text-gray-300">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-green-400 outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-gray-400"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300">Phone Number</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-green-400 outline-none"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-300">UPI ID</label>
                            <input
                                type="text"
                                value={upi}
                                onChange={(e) => setUpi(e.target.value)}
                                className="p-3 w-full border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-green-400 outline-none"
                            />
                        </div>

                        {/* Update Profile Button */}
                        <button
                            type="submit"
                            className="bg-green-500 px-4 py-2 w-full rounded-md text-white hover:bg-green-600 transition font-semibold"
                        >
                            Update Profile
                        </button>
                    </form>
                </div>
            </div>
        </div>
       
       
    );
}

export default Profile;