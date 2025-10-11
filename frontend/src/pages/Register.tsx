import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    monthly_salary: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/register/`, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        monthly_salary: Number(form.monthly_salary),
      });
      setMessage(
        `✅ Customer Registered! ID: ${res.data.customer.customer_id}, Approved Limit: ₹${res.data.customer.approved_limit}`
      );
    } catch (err: any) {
      console.error(err.response?.data || err);
      setMessage("❌ Registration failed. Please check your inputs.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      {/* The pt-20 ensures it's centered even with a navbar */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Register New Customer
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          <input
            type="number"
            name="monthly_salary"
            value={form.monthly_salary}
            onChange={handleChange}
            placeholder="Monthly Income"
            required
            min="0"
            step="1000"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-3 rounded-lg hover:bg-purple-800 transition-colors font-semibold"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
