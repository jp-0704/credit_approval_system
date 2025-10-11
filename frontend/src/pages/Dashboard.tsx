import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [m, t] = await Promise.all([
          axios.get(`${API_BASE}/dashboard/metrics`),
          axios.get(`${API_BASE}/dashboard/timeseries`),
        ]);
        setMetrics(m.data);
        setLoans(t.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credit Approval Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardHeader><CardTitle>Total Customers</CardTitle></CardHeader><CardContent>{metrics?.total_customers ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total Loans</CardTitle></CardHeader><CardContent>{metrics?.total_loans ?? 0}</CardContent></Card>
        <Card><CardHeader><CardTitle>Approval Rate</CardTitle></CardHeader><CardContent>{metrics?.avg_approval_rate ?? "N/A"}%</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Loan Approvals</CardTitle></CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <p>No loans found.</p>
          ) : (
            <table className="w-full border">
              <thead><tr><th>Loan ID</th><th>Customer ID</th><th>Amount</th></tr></thead>
              <tbody>{loans.map((l) => (<tr key={l.id}><td>{l.id}</td><td>{l.customer_id}</td><td>{l.loan_amount}</td></tr>))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
