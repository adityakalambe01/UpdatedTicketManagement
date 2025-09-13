"use client";

import { useState } from "react";
import { testRazorpay } from "../../../actions/testRazorpay";

export default function TestRazorpay() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await testRazorpay();
      setResult(res);
    } catch (error) {
      setResult({ success: false, error: "Test failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Razorpay Integration</h1>
      
      <button
        onClick={handleTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Testing..." : "Test Razorpay"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}