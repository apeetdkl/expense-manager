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
import ResetPassword from "./components/Auth/ResetPassword";  
import BalancePage from "./components/pages/BalancePage";
import ExpenseTracker from "./components/pages/ExpenseTracker";
import "./index.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Hide Navbar on login, reset-password, and register pages
  const hideNavbarRoutes = ["/login", "/reset-password", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname) || loading; // Hide Navbar when loading
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut();
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

  

  return (
    <div>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<div className="w-full min-h-screen bg-gray-900 flex items-center justify-center"><ResetPassword /></div>} />  
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login setSession={setSession} />} />
        <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/profile" element={session ? <Profile session={session} /> : <Navigate to="/login" replace />} />
        <Route path="/expenses" element={session ? <ExpenseForm /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} />
        <Route path="/expense-tracker" element={session ? <ExpenseTracker /> : <Navigate to="/login" replace />} />
        <Route path="/balances" element={session ? <BalancePage /> : <Navigate to="/login" replace />} />
      </Routes>

      {!hideNavbar && <Footer />}
    </div>
  );
}

export default App;