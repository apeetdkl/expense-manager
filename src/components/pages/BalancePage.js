import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { RefreshCw, Wallet , Download} from "lucide-react";
import { CSVLink } from "react-csv"; 


const BalancePage = () => {
  const [balances, setBalances] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [simplifiedBalances, setSimplifiedBalances] = useState([]);
 
    
    const [showSummary, setShowSummary] = useState(false);


    useEffect(() => {
      fetchBalances();
      fetchUsers();
      fetchExpenses();
    }, []);
  

 

    const summarizeBalances = () => {
      const simplified = {};
    
      // Aggregate past balances
      simplifiedBalances.forEach(({ from_user, to_user, balance }) => {
        const key = `${from_user}-${to_user}`;
        simplified[key] = { from_user, to_user, balance };
      });
    
      // Add new balances and accumulate
      balances.forEach(({ from_user, to_user, balance }) => {
        const key = `${from_user}-${to_user}`;
        const reverseKey = `${to_user}-${from_user}`;
    
        if (simplified[reverseKey]) {
          if (balance > simplified[reverseKey].balance) {
            simplified[key] = {
              from_user,
              to_user,
              balance: balance - simplified[reverseKey].balance,
            };
            delete simplified[reverseKey];
          } else {
            simplified[reverseKey].balance -= balance;
          }
        } else if (simplified[key]) {
          simplified[key].balance += balance; // ✅ Accumulate previous and new balances
        } else {
          simplified[key] = { from_user, to_user, balance };
        }
      });
    
      // Filter out zero balances
      setSimplifiedBalances(Object.values(simplified).filter(({ balance }) => balance > 0));
      setShowSummary(true);
    };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
  
    fetchUser();
  }, []);
 

  const handleRemoveExpense = async (expenseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;
  
    try {
      const { error } = await supabase
        .from("expense")
        .delete()
        .eq("expense_id", expenseId);
  
      if (error) {
        console.error("Error deleting expense:", error.message);
      } else {
        // Update state to reflect changes
        setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp.expense_id !== expenseId));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const prepareExpenseCSV = () => {
    const data = expenses.map((expense) => ({
      Payer: getUserName(expense.payer_id),
      Participants: getUserNames(expense.participants),
      Amount: `₹${expense.amount.toFixed(2)}`,
      "Split Type": expense.split_type,
      Date: new Date(expense.created_at).toLocaleDateString(),
    }));
  
    setCsvData(data);
    setFileName("Expenses.csv");
  };


  // Function to generate CSV data
const handleDownloadCSV = () => {
  const csvData = [
    ["Payer", "Participants", "Amount", "Split Type", "Date"], // CSV Header
    ...expenses.map((expense) => [
      getUserName(expense.payer_id),
      getUserNames(expense.participants),
      `₹${expense.amount.toFixed(2)}`,
      expense.split_type,
      new Date(expense.created_at).toLocaleDateString(),
    ]),
  ];
  return csvData;
};



  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data);
  };

  const fetchBalances = async () => {
    const { data, error } = await supabase.from("balances").select("*");
    if (error) {
      console.error("Error fetching balances:", error);
      return;
    }
    setBalances(data);
  };

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from("expense").select("*");
    if (error) {
      console.error("Error fetching expenses:", error);
      return;
    }
    setExpenses(data);
  };

  const getUserName = (userId) => {
    return users.find((user) => user.id === userId)?.name || "Unknown"; 
  };

  const groupedBalances = balances.reduce((acc, balance) => {
    const key = `${balance.from_user}-${balance.to_user}`;
    if (!acc[key]) {
      acc[key] = { ...balance };
    } else {
      acc[key].balance += balance.balance; // Sum balances
    }
    return acc;
  }, {});

  const getUserNames = (userIds) => {
    if (!userIds) return "Unknown";
  
    let userIdArray;
  
    try {
      userIdArray = JSON.parse(userIds); // Parse JSON string into an array
    } catch (error) {
      console.error("Error parsing participants JSON:", error);
      return "Unknown";
    }
  
    if (!Array.isArray(userIdArray)) return "Unknown";
  
    // Map user IDs to names
    const participantNames = userIdArray.map(
      (id) => users.find((user) => user.id === id)?.name || "Unknown"
    );
  
    return participantNames.join(", ");
  };
  

  return (
    <div className="pt-6">
      <div className="p-4">
        <div className="max-w-6xl w-full mx-auto bg-dark-800 shadow-2xl rounded-2xl border border-dark-700 overflow-hidden">
          {/* Header */}
          <div className="bg-dark-700 p-4 pt-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-xl sm:text-2xl font-bold text-blue-300">Money Settlement</h1>
            </div>
  
            {/* Buttons: Refresh & Download */}
            <div className="flex space-x-4">
              <button
                className="text-gray-400 hover:text-blue-400 transition"
                onClick={() => {
                  fetchBalances();
                  fetchExpenses();
                }}
              >
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
  
              {/* CSV Download Button */}
              <CSVLink
                data={handleDownloadCSV()}
                filename="expenses.csv"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              </CSVLink>
            </div>
          </div>
  
          {/* Sections Container */}
          <div className="flex flex-col space-y-6 p-4 sm:p-6">
            {/* Balance List */}
           {/* Outstanding Balances Section */}
<div className="bg-dark-700 rounded-xl p-4 sm:p-5">
  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-300">
    Outstanding Balances
  </h2>
  {Object.keys(groupedBalances).length === 0 ? (
    <p className="text-center text-gray-400">No outstanding balances!</p>
  ) : (
    <div className="space-y-3 sm:space-y-4">
      {Object.values(groupedBalances)
        .filter((balance) => balance.from_user === user?.id || balance.to_user === user?.id) // 🔥 Show only user-related balances
        .map((balance) => {
          const fromUser = getUserName(balance.from_user);
          const toUser = getUserName(balance.to_user);
          const balanceAmount = balance.balance ? Math.abs(balance.balance).toFixed(2) : "0.00";

          // Determine background color based on logged-in user
          const isUserOwing = user?.id === balance.from_user;
          const cardBgColor = isUserOwing ? "bg-red-800" : "bg-green-800"; // Red if owing, Green if owed

          return (
            <div
              key={`${balance.from_user}-${balance.to_user}`}
              className={`flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 rounded-xl shadow-md ${cardBgColor}`}
            >
              <span className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-0">
                {fromUser} owes {toUser}
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                ₹{balanceAmount}
              </span>
            </div>
          );
        })}
    </div>
  )}
  
  {/* Summarize Balances Button */}
  <button
    onClick={summarizeBalances}
    className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition w-full"
  >
    🔄 Summarize Balances
  </button>

  {/* Summary Popup */}
  {showSummary && (
    <div className="mt-6 p-4 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Simplified Settlements</h3>
      {simplifiedBalances.length > 0 ? (
        <ul className="space-y-2">
          {simplifiedBalances
            .filter(({ from_user, to_user }) => from_user === user?.id || to_user === user?.id) // 🔥 Show only user-related settlements
            .map(({ from_user, to_user, balance }, index) => {
              const fromUser = getUserName(from_user);
              const toUser = getUserName(to_user);
              return (
                <li key={index} className="bg-gray-700 p-3 rounded-lg">
                  {fromUser} owes {toUser} <span className="font-bold">₹{balance.toFixed(2)}</span>
                </li>
              );
            })}
        </ul>
      ) : (
        <p className="text-green-400">All debts are settled! 🎉</p>
      )}
      <button
        onClick={() => setShowSummary(false)}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg w-full hover:bg-red-600 transition"
      >
        Close
      </button>
    </div>
  )}
</div>
    </div>
  
            {/* Expense History */}
<div className="bg-dark-700 rounded-xl p-4 sm:p-5">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg sm:text-xl font-semibold text-blue-300">Expense History</h2>
    <button
      className="text-gray-400 hover:text-green-400 transition flex items-center space-x-1"
      onClick={() => {
        prepareExpenseCSV();
        setTimeout(() => document.getElementById("expense-csv-download").click(), 500);
      }}
    >
      <Download className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="hidden sm:inline">Download</span>
    </button>
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-dark-600">
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Payer</th>
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Participants</th>
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Amount</th>
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Split Type</th>
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Date</th>
          <th className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">Action</th>
        </tr>
      </thead>
      <tbody>
        {expenses.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center p-3 text-gray-400">
              No expenses recorded!
            </td>
          </tr>
        ) : (
          expenses.map((expense) => (
            <tr
              key={expense.expense_id}
              className="border-b border-dark-600 hover:bg-dark-600"
            >
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                {getUserName(expense.payer_id)}
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                {getUserNames(expense.participants)}
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                ₹{expense.amount.toFixed(2)}
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                {expense.split_type}
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                {new Date(expense.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm text-center">
                <button
                  onClick={() => handleRemoveExpense(expense.expense_id)}
                  className="text-red-400 hover:text-red-500 transition"
                >
                  ❌ Remove
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

{/* Hidden CSV Download Link */}
<CSVLink data={csvData} filename="Expenses.csv" className="hidden" id="expense-csv-download" />
          </div>
        </div>
      </div>
    
 
);
};
export default BalancePage;