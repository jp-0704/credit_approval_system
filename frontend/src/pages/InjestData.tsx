import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function IngestData() {
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [loanFile, setLoanFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!customerFile || !loanFile) {
      setMessage("⚠️ Please upload both files.");
      return;
    }

    const formData = new FormData();
    formData.append("customer_file", customerFile);
    formData.append("loan_file", loanFile);

    try {
      const res = await axios.post(`${API_BASE}/ingest-data/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Fix: backend returns { "message": "Data ingestion completed successfully." }
      if (res.status === 200 && res.data.message) {
        setMessage("✅ Upload successful!");
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("❌ Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Upload Excel Files
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Customer Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setCustomerFile(e.target.files?.[0] || null)}
              className="block w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Loan Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setLoanFile(e.target.files?.[0] || null)}
              className="block w-full border border-gray-300 rounded p-2"
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-800"
          >
            Upload
          </button>

          {message && (
            <p className="text-center mt-4 text-gray-700 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
