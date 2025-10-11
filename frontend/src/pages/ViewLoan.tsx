import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function ViewLoan() {
  const [loanId, setLoanId] = useState("");
  const [loan, setLoan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLoan = async () => {
    try {
      const res = await axios.get(`${API_BASE}/view-loan/${loanId}/`);
      setLoan(res.data);
      setError(null);
    } catch (err) {
      setError("❌ Loan not found. Check ID and try again.");
      setLoan(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔍 View Loan Details</h2>

        <input
          type="number"
          placeholder="Enter Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />

        <button
          onClick={fetchLoan}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
        >
          Fetch
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {loan && (
          <div className="mt-6 text-left space-y-2 bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-800 mb-2">
              Loan ID: {loan.loan_id}
            </h3>
            <p><strong>Customer ID:</strong> {loan.customer?.customer_id}</p>
            <p><strong>Customer Name:</strong> {loan.customer?.first_name} {loan.customer?.last_name}</p>
            <p><strong>Amount:</strong> ₹{loan.loan_amount.toLocaleString()}</p>
            <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
            <p><strong>Tenure:</strong> {loan.tenure} months</p>
            <p><strong>Start Date:</strong> {loan.start_date}</p>
            <p><strong>End Date:</strong> {loan.end_date}</p>
            <p>
              <strong>Status:</strong>{" "}
              {loan.fully_paid ? (
                <span className="text-green-600 font-medium">✅ Closed</span>
              ) : (
                <span className="text-red-500 font-medium">❌ Active</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
