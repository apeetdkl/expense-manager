import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./services/supabaseClient";
import Navbar from "./components/layout/Navbar";

import Footer from "./components/layout/Footer";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Profile from "./components/pages/Profile";
import Dashboard from "./components/pages/Dashboard";
import ExpenseForm from "./components/pages/ExpenseForm";
import Balances from "./components/pages/BalancePage";
 
import ResetPassword from "./components/Auth/ResetPassword";  
import BalancePage from "./components/pages/BalancePage";
import ExpenseTracker from "./components/pages/ExpenseTracker";
import "./index.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const location = useLocation(); // Get current route

  // Hide Navbar on login, reset-password, and register pages
  const hideNavbarRoutes = ["/login", "/reset-password", "/register"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);


  useEffect(() => {
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.email_confirmed_at) {
            await supabase.auth.signOut(); // 👈 Force logout if email is not confirmed
        }
    };
    checkUser();
}, []);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("❌ Error fetching session:", error);
      else setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p className="text-lg text-#80005a-400">!!...Loading...!!</p>
      </div>
    );
  }

  return (
    <div>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<div className="w-full min-h-screen bg-gray-900 flex items-center justify-center"><ResetPassword /></div>} />  
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login setSession={setSession} />} />
        <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" replace />} />
        <Route path="/expenses" element={session ? <ExpenseForm /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} />
      </Routes>

      {/* Only show these components if not on the profile page */}
      {location.pathname !== "/profile" && session && (
        <>
          <ExpenseTracker />
          <BalancePage />
        </>
      )}

      <Footer />
    </div>
  );
}

export default App;