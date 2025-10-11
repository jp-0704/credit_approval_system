import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function CreateLoan() {
  const [form, setForm] = useState({
    customer_id: "",
    loan_amount: "",
    interest_rate: "",
    tenure: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/create-loan/`, form);
      setMessage(`✅ Loan Created! Loan ID: ${res.data.loan?.loan_id || "N/A"}`);
    } catch (err: any) {
      console.error(err.response?.data || err);
      setMessage("❌ Failed to create loan. Please check inputs.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create New Loan</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            name="customer_id"
            placeholder="Customer ID"
            value={form.customer_id}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />

          <input
            type="number"
            name="loan_amount"
            placeholder="Loan Amount"
            value={form.loan_amount}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />

          <input
            type="number"
            step="0.1"
            name="interest_rate"
            placeholder="Interest Rate (%)"
            value={form.interest_rate}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />

          <input
            type="number"
            name="tenure"
            placeholder="Tenure (months)"
            value={form.tenure}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700"
          >
            Create Loan
          </button>
        </form>

        {message && <p className="mt-4 text-center font-medium">{message}</p>}
      </div>
    </div>
  );
}
