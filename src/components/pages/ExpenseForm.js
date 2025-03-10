import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // ✅ Link back to Dashboard

function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert("User not logged in");
      return;
    }
    setUserId(userData.user.id);
    fetchDashboardBalance(userData.user.id);
    fetchExpenses(userData.user.id);
  };

  const fetchDashboardBalance = async (userId) => {
    const { data, error } = await supabase
      .from("balance")
      .select("total_money")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching balance:", error);
    } else {
      setBalance(data.total_money);
    }
  };

  const updateDashboardBalance = async (newBalance) => {
    const { error } = await supabase
      .from("balance")
      .update({ total_money: newBalance })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating balance:", error);
    } else {
      setBalance(newBalance);
      fetchExpenses(userId); // Refresh expenses after updating balance
    }
  };

  const fetchExpenses = async (userId) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
    } else {
      setExpenses(data);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const expenseAmount = Number(amount);
    if (expenseAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    const expense = {
      user_id: userId,
      amount: expenseAmount,
      category,
      date,
      payment_mode: paymentMode,
      description,
    };

    const { error } = await supabase.from("expenses").insert([expense]);

    if (error) {
      alert("Error adding expense: " + error.message);
    } else {
      const newBalance = balance - expenseAmount;
      await updateDashboardBalance(newBalance);
      setAmount("");
      setCategory("");
      setDate("");
      setPaymentMode("");
      setDescription("");
    }
  };

  const handleDeleteExpense = async (id, expenseAmount) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      alert("Error deleting expense: " + error.message);
    } else {
      const newBalance = balance + Number(expenseAmount);
      await updateDashboardBalance(newBalance);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4 md:px-6 pt-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg"
      >
       
        <h2 className="text-xl font-semibold text-green-300 mb-4 text-center">
          Add Expense
        </h2>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
          />
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            required
          >
            <option value="">Payment Mode</option>
            <option value="cash">Cash</option>
            <option value="Paytm">Paytm</option>
          </select>
          <button
  type="submit"
  className="w-full py-2 rounded text-white font-bold transition bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-700 hover:via-red-600 hover:to-red-800"
>
  Add Expense
</button>
        </form>
      </motion.div>

      {/* Responsive Table */}
      <div className="mt-6 w-full max-w-3xl overflow-x-auto">
        <table className="w-full text-left bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-700 text-sm">
            <tr>
              <th className="p-2 md:p-3">Amount</th>
              <th className="p-2 md:p-3">Category</th>
              <th className="p-2 md:p-3">Date</th>
              <th className="p-2 md:p-3 hidden md:table-cell">Payment Mode</th>
              <th className="p-2 md:p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t border-gray-700 text-sm md:text-base">
                <td className="p-2 md:p-3">{expense.amount}</td>
                <td className="p-2 md:p-3">{expense.category}</td>
                <td className="p-2 md:p-3">{expense.date}</td>
                <td className="p-2 md:p-3 hidden md:table-cell">{expense.payment_mode}</td>
                <td className="p-2 md:p-3 flex space-x-2">
                  <button
                    onClick={() => handleDeleteExpense(expense.id, expense.amount)}
                    className="text-red-400 hover:text-red-500"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
       
          </tbody>
        </table>
        <div className="flex justify-center mt-6">
  <Link to="/dashboard">
    <button className="bg-green-500 px-6 py-2 rounded-lg text-white font-bold hover:bg-green-600 transition">
      ← Back to Dashboard
    </button>
  </Link>
</div>
      </div>
    </div>
  );
}

export default ExpenseTracker;