import React, { useState, useEffect } from 'react';
import { supabase } from "../../services/supabaseClient";
import { FileText } from "lucide-react";
import BalancePage from './BalancePage';
import { 
  Users, 
  DollarSign, 
  PlusCircle, 
  Calculator, 
  RefreshCw ,
  Wallet,
  CreditCard,
  Divide
} from 'lucide-react';



const ExpenseTracker = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [selectedPaidBy, setSelectedPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitType, setSplitType] = useState('EQUAL');
  const [exactShares, setExactShares] = useState({});
  const [percentShares, setPercentShares] = useState({});
  const [balances, setBalances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [ data, setData ] = useState([]);

  // Fetch Users on Component Mount
  useEffect(() => {
    fetchUsers();
    fetchExpenses();
    fetchBalances();
  }, []);

  /// Fetch All Users from Supabase
const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    setUsers(data);
  };
  
  // Fetch Expenses from Supabase
  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expense').select('*');
    
    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }
    setExpenses(data);
  };
  
  // Fetch Balances for Current User
  const fetchBalances = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('balances')
        .select('*')
        .or(`from_user.eq.${userId},to_user.eq.${userId}`); // Ensures correct OR filter
  
      if (error) {
        console.error('Fetch Balances Error:', error);
        return;
      }
  
      setBalances(data);
    } catch (err) {
      console.error('Fetch Balances Catch:', err);
    }
  };
  
  // Calculate Split Amounts
  const calculateShares = () => {
    const totalAmount = parseFloat(amount);
  
    switch (splitType) {
      case 'EQUAL':
        const equalShare = totalAmount / selectedParticipants.length;
        return selectedParticipants.map(userId => ({
          user_id: userId,
          share_amount: parseFloat(equalShare.toFixed(2)) // Ensure rounding consistency
        }));
  
      case 'EXACT':
        return selectedParticipants.map(userId => ({
          user_id: userId,
          share_amount: parseFloat(exactShares[userId] || 0)
        }));
  
      case 'PERCENT':
        return selectedParticipants.map(userId => ({
          user_id: userId,
          share_amount: parseFloat(((percentShares[userId] || 0) / 100) * totalAmount).toFixed(2)
        }));
  
      default:
        return [];
    }
  };
  
  // Validate Inputs
  const validateInputs = () => {
    if (!selectedPaidBy || !amount || selectedParticipants.length === 0) {
      alert('Please fill all required fields');
      return false;
    }
  
    if (splitType === 'EXACT') {
      const total = Object.values(exactShares).reduce((sum, share) => sum + parseFloat(share || 0), 0);
      if (Math.abs(total - parseFloat(amount)) >= 0.01) {
        alert('Exact shares must sum up to the total amount');
        return false;
      }
    }
  
    if (splitType === 'PERCENT') {
      const total = Object.values(percentShares).reduce((sum, share) => sum + parseFloat(share || 0), 0);
      if (Math.abs(total - 100) >= 0.01) {
        alert('Percentage shares must total 100%');
        return false;
      }
    }
  
    return true;
  };
  
  // Add Expense Transaction
  const handleAddExpense = async () => {
    try {
      if (!validateInputs()) return;
  
      const shares = calculateShares();
      const expenseData = {
        payer_id: selectedPaidBy,
        description,
        amount: parseFloat(amount),
        split_type: splitType,
        participants: selectedParticipants,
        created_at: new Date().toISOString(),
      };
  
      console.log("Request Payload:", expenseData);
  
      const { data, error } = await supabase.from("expense").insert([expenseData]).select().single();
  
      if (error) {
        console.error("Supabase Error:", error);
        alert(`Expense Add Failed: ${error.message}`);
        return;
      }
  
      console.log("Inserted Expense Data:", data);
      await updateBalances(selectedPaidBy, shares); // Call balance update function
      alert("Expense added successfully!");
      resetForm();
    } catch (error) {
      console.error("Full Error Object:", error);
      alert(`Expense Add Failed: ${error.message}`);
    }
  };
  
  // Update Balances After Expense
 // Update Balances After Expense
const updateBalances = async (payerId, shares) => {
    for (const share of shares) {
      if (share.user_id === payerId) continue; // Skip payer
  
      const amountOwed = parseFloat(share.share_amount || 0); // Ensure it's a number
  
      if (isNaN(amountOwed)) {
        console.error("Invalid share amount:", share.share_amount);
        continue; // Skip this iteration if invalid
      }
  
      const { error, data } = await supabase.rpc("update_balance", {
        p_from_user: share.user_id, // User who owes
        p_to_user: payerId,         // User who is owed
        p_balance: amountOwed
      });
  
      if (error) {
        console.error("Balance update error:", error);
      }
  
      if (data?.length > 0) {
        // Update existing balance
        const newBalance = parseFloat(data[0].balance) + amountOwed;
        await supabase
          .from("balances")
          .update({ balance: parseFloat(newBalance.toFixed(2)) })
          .eq("from_user", share.user_id)
          .eq("to_user", payerId);
      } else {
        // Insert new balance if no record exists
        await supabase.from("balances").insert([
          { from_user: share.user_id, to_user: payerId, balance: parseFloat(amountOwed.toFixed(2)) }
        ]);
      }
    }
  };
  
  // Reset Form
  const resetForm = () => {
    setSelectedPaidBy('');
    setAmount('');
    setDescription('');
    setSelectedParticipants([]);
    setSplitType('EQUAL');
    setExactShares({});
    setPercentShares({});
  };
  const handleEqualSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    const numParticipants = selectedParticipants.length;
  
    if (numParticipants === 0) return;
  
    // Calculate equal share and round down
    let equalShare = Math.floor((totalAmount / numParticipants) * 100) / 100;
  
    // Calculate remainder to distribute due to rounding
    let remainingAmount = totalAmount - equalShare * numParticipants;
  
    // Assign shares
    const newEqualShares = selectedParticipants.reduce((acc, userId, index) => {
      acc[userId] = equalShare;
      return acc;
    }, {});
  
    // Distribute the remaining amount to the first few participants
    for (let i = 0; i < remainingAmount * 100; i++) {
      const userId = selectedParticipants[i % numParticipants]; // Cycle through users
      newEqualShares[userId] = parseFloat((newEqualShares[userId] + 0.01).toFixed(2));
    }
  
    setExactShares(newEqualShares);
  
  };
// Render Split Type Inputs with Live Calculations
const renderSplitTypeInputs = () => {
    const totalAmount = parseFloat(amount) || 0;
  
    // Handle exact split input change
    const handleExactChange = (userId, value) => {
      const newExactShares = { ...exactShares, [userId]: parseFloat(value) || 0 };
      const totalExact = Object.values(newExactShares).reduce((sum, val) => sum + val, 0);
  
      // Check if the sum exceeds the total amount
      if (totalExact > totalAmount) {
        alert("Total shares exceed the total amount!");
        return;
      }
  
      setExactShares(newExactShares);
    };
  
    // Handle percentage split input change
    const handlePercentChange = (userId, value) => {
      const newPercentShares = { ...percentShares, [userId]: parseFloat(value) || 0 };
      const totalPercent = Object.values(newPercentShares).reduce((sum, val) => sum + val, 0);
  
      // Ensure total percent does not exceed 100
      if (totalPercent > 100) {
        alert("Total percentage cannot exceed 100%!");
        return;
      }
  
      setPercentShares(newPercentShares);
    };
  
    return (
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
        {selectedParticipants.map((userId, index) => (
          <div 
            key={userId} 
            className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full md:w-auto"
          >
            {/* Participant Name */}
            <span className="text-gray-200 font-medium w-32 md:w-40">{users.find(u => u.id === userId)?.name}</span>
  
            {/* Input Field for Exact or Percentage */}
            <input
              type="number"
              value={splitType === 'EXACT' ? exactShares[userId] || '' : percentShares[userId] || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (splitType === 'EXACT') {
                  handleExactChange(userId, value);
                } else if (splitType === 'PERCENT') {
                  handlePercentChange(userId, value);
                }
              }}
              className="w-full md:w-48 px-4 py-2 border-2 border-red-500 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder={splitType === 'EXACT' ? 'Enter amount' : 'Enter %'}
            />
  
            {/* Display calculated amount for PERCENT split */}
            {splitType === 'PERCENT' && (
              <span className="text-green-400 ml-2">
                ₹{((percentShares[userId] || 0) / 100 * totalAmount).toFixed(2)}
              </span>
            )}
          </div>
        ))}
  
        {/* Show total calculations */}
        <div className="text-gray-300 font-medium mt-4">
          {splitType === 'EXACT' && (
            <p>Total: ₹{Object.values(exactShares).reduce((sum, val) => sum + (val || 0), 0).toFixed(2)} / ₹{totalAmount.toFixed(2)}</p>
          )}
          {splitType === 'PERCENT' && (
            <p>Total: {Object.values(percentShares).reduce((sum, val) => sum + (val || 0), 0).toFixed(2)}% / 100%</p>
          )}
        </div>
      </div>
    );
  };
  // Rest of the component remains the same as previous implementation
  // (with the renderSplitTypeInputs and other UI components)
  return (
    
          <div className="p-4">
            <div className="max-w-6xl w-full mx-auto bg-dark-800 shadow-2xl rounded-2xl border border-dark-700 overflow-hidden">
              {/* Header */}
              <div className="bg-dark-700 p-4 pt-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
                  <h1 className="text-xl sm:text-2xl font-bold text-blue-300">Group Expense Form</h1>
                </div>
          
                        <button
                          className="text-gray-400 hover:text-blue-400 transition"
                          onClick={resetForm}
                          
                        >
                          <RefreshCw className="w-6 h-6   sm:w-6 sm:h-6" />
                        </button>
                      </div>
  
        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 md:p-8 h-[calc(100%-80px)] overflow-auto">
          {/* Paid By Selection */}
          <div>
            <label className="flex items-center text-gray-300 mb-3">
              <DollarSign className="mr- text-emerald-500 w-6 h-6" /> Paid By
            </label>
            <select
              value={selectedPaidBy}
              onChange={(e) => setSelectedPaidBy(e.target.value)}
              className="w-full px-4 py-3 h-12 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" className="bg-gray-800 text-gray-300">
                Select Payer
              </option>
              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                  className="bg-gray-800 text-gray-300"
                >
                  {user.name}
                </option>
              ))}
            </select>
          </div>


{/* Description Input */}
<div>
  <label className="flex items-center text-gray-300 mb-3">
    <FileText className="mr-1 text-yellow-500 w-6 h-6" /> Description
  </label>
  <input
    type="text"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
    placeholder="Enter description (e.g., Dinner at XYZ restaurant)"
  />
</div>
          {/* Amount Input */}
          <div>
            <label className="flex items-center text-gray-300 mb-3">
              <Wallet className="mr-1 text-blue-500 w-6 h-6" /> Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 pl-8 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total amount Paid"
              />
            </div>
          </div>

          {/* Participants Selection */}
          <div>
            <label className="flex items-center text-gray-300 mb-3">
              <Users className="mr-1 text-purple-500 w-6 h-6" /> Participants
            </label>
            <div className="flex flex-wrap gap-3">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedParticipants((prev) =>
                      prev.includes(user.id)
                        ? prev.filter((id) => id !== user.id)
                        : [...prev, user.id]
                    );
                  }}
                  className={`px-5 py-2 rounded-full text-sm transition ${
                    selectedParticipants.includes(user.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          {/* Split Type Selection */}
          <div>
            <label className="flex items-center text-gray-300 mb-3">
              <Divide className="mr- text-pink-500 w-6 h-6" /> Split Type
            </label>
            <select
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
              className="w-full px-4 py-3 h-12 bg-gray-800 border border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="EQUAL" className="bg-gray-800 text-gray-300">
                Split Equally
              </option>
              <option value="EXACT" className="bg-gray-800 text-gray-300">
                Exact Amounts
              </option>
              <option value="PERCENT" className="bg-gray-800 text-gray-300">
                Percentage Split
              </option>
            </select>
          </div>

          {(splitType === 'EXACT' || splitType === 'PERCENT') && (
            <div className="space-y-3">
              {renderSplitTypeInputs()}
            </div>
          )}

          {/* Add Expense Button */}
          <div className="mt-6">
            <button
            onClick={handleAddExpense}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center">
              <PlusCircle className="mr-2 w-5 h-5" /> Add Expense
            
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
