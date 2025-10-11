import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import IngestData from "./pages/InjestData";
import Register from "./pages/Register";
import CheckEligibility from "./pages/CheckEligibility";
import CreateLoan from "./pages/CreateLoan";
import ViewLoan from "./pages/ViewLoan";
import LoanHistory from "./pages/LoanHistory";

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-900 text-white p-4 flex flex-wrap justify-center gap-6">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/ingest" className="hover:underline">Ingest Data</Link>
        <Link to="/register" className="hover:underline">Register</Link>
        <Link to="/check-eligibility" className="hover:underline">Check Eligibility</Link>
        <Link to="/create-loan" className="hover:underline">Create Loan</Link>
        <Link to="/view-loan" className="hover:underline">View Loan</Link>
        <Link to="/loan-history" className="hover:underline">Loan History</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ingest" element={<IngestData />} />
        <Route path="/register" element={<Register />} />
        <Route path="/check-eligibility" element={<CheckEligibility />} />
        <Route path="/create-loan" element={<CreateLoan />} />
        <Route path="/view-loan" element={<ViewLoan />} />
        <Route path="/loan-history" element={<LoanHistory />} />
      </Routes>
    </Router>
  );
}
