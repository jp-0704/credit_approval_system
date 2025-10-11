import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function LoanHistory() {
  const [customerId, setCustomerId] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/loan-history/${customerId}/`);
      setLoans(res.data.loans || []);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("❌ Failed to fetch loan history.");
      setLoans([]);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">Loan History</h2>

        <div className="flex space-x-2 mb-6">
          <input
            type="number"
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button
            onClick={fetchHistory}
            className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"
          >
            Fetch
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {loans.length > 0 ? (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Loan ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Tenure</th>
                <th className="p-2">Interest</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.loan_id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{loan.loan_id}</td>
                  <td className="p-2">₹{loan.loan_amount.toLocaleString()}</td>
                  <td className="p-2">{loan.tenure}</td>
                  <td className="p-2">{loan.interest_rate}%</td>
                  <td className="p-2">{loan.fully_paid ? "✅ Paid" : "❌ Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !error && (
            <p className="text-gray-500 text-center italic">No loans found.</p>
          )
        )}
      </div>
    </div>
  );
}
