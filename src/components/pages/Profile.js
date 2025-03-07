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

    useEffect(() => {
        const fetchUser = async () => {
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

            setLoading(false);
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

    const handleProfilePicUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !user) return;
    
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `profile_pics/${fileName}`;
    
        // Fetch the current profile image before updating
        const { data: profileData, error: fetchError } = await supabase
            .from("profiles")
            .select("profile_image")
            .eq("id", user.id)
            .single();
    
        if (fetchError) {
            console.error("❌ Error fetching existing profile image:", fetchError);
        }
    
        const oldProfilePicURL = profileData?.profile_image;
    
        // Upload new profile picture
        const { error: uploadError } = await supabase.storage
            .from("profile_pictures")
            .upload(filePath, file, { upsert: true });
    
        if (uploadError) {
            alert("❌ Error uploading profile picture: " + uploadError.message);
            return;
        }
    
        // Get public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
            .from("profile_pictures")
            .getPublicUrl(filePath);
    
        const publicURL = publicUrlData.publicUrl;
    
        // Update profile picture URL in Supabase database
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ profile_image: publicURL })
            .eq("id", user.id);
    
        if (updateError) {
            alert("❌ Error saving profile picture: " + updateError.message);
            return;
        }
    
        // Delete old profile picture if it exists and is not the placeholder
        if (oldProfilePicURL && !oldProfilePicURL.includes("via.placeholder.com")) {
            const oldFileName = oldProfilePicURL.split("/").pop();
            const oldFilePath = `profile_pics/${oldFileName}`;
    
            const { error: deleteError } = await supabase.storage
                .from("profile_pictures")
                .remove([oldFilePath]);
    
            if (deleteError) {
                console.error("❌ Error deleting old profile picture:", deleteError);
            }
        }
    
        setProfilePicURL(publicURL);
        alert("✅ Profile picture updated!");
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p className="text-lg text-green-400">Loading Profile...</p>
            </div>
        );
    }

    return (
      
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6 pt-20">
            <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-lg text-white">
                <h2 className="text-3xl font-bold text-center mb-6 text-green-400">Profile</h2>
                <div className="flex flex-col items-center">
                    {/* Profile Image */}
                    <div className="relative w-40 h-40 mb-4">
                        <img
                            src={profilePicURL}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-4 border-green-400 shadow-lg"
                        />
                    </div>

                    {/* Upload Button */}
                    <label className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-green-600 transition font-semibold mb-6">
                        📷 Upload Another Photo
                        <input type="file" className="hidden" onChange={handleProfilePicUpload} />
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