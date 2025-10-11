import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function CheckEligibility() {
  const [form, setForm] = useState({
    customer_id: "",
    loan_amount: "",
    interest_rate: "",
    tenure: "",
  });
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/check-eligibility/`, form);
      setResponse(res.data);
      setError(null);
    } catch (err: any) {
      setError("Eligibility check failed.");
      setResponse(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Check Loan Eligibility
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="customer_id"
            placeholder="Customer ID"
            type="number"
            value={form.customer_id}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            name="loan_amount"
            placeholder="Loan Amount"
            type="number"
            value={form.loan_amount}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            name="interest_rate"
            placeholder="Interest Rate (%)"
            type="number"
            step="0.1"
            value={form.interest_rate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <input
            name="tenure"
            placeholder="Tenure (months)"
            type="number"
            value={form.tenure}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Check Eligibility
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {response && (
          <div className="mt-6 p-4 border rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-700 mb-2 text-center">
              Eligibility Result
            </h3>
            <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
