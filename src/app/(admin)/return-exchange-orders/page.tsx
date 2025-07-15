"use client";
import { useEffect, useState } from "react";
import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchAllReturnRequests } from '@/lib/apiService';
import { formatDate } from '@/lib/utils';

export default function ReturnExchangeOrdersPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchAllReturnRequests({ page })
      .then(res => {
        setRequests(res.data.requests || []);
        setTotalPages(res.pagination?.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Return/Exchange Orders" description="Manage all return and exchange requests." />
      <Card className="p-4 mt-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Order</th>
                  <th className="px-2 py-1 text-left">Customer</th>
                  <th className="px-2 py-1 text-left">Type</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Reason</th>
                  <th className="px-2 py-1 text-left">Requested At</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req: any) => (
                  <tr key={req.returnRequest._id}>
                    <td className="px-2 py-1">
                      <a href={`/orders/${req.orderId}`} className="text-primary underline">{req.orderId}</a>
                    </td>
                    <td className="px-2 py-1">{req.customerInfo?.name || '-'}</td>
                    <td className="px-2 py-1 capitalize">{req.returnRequest.type}</td>
                    <td className="px-2 py-1 capitalize">{req.returnRequest.status}</td>
                    <td className="px-2 py-1">{req.returnRequest.reason}</td>
                    <td className="px-2 py-1">{formatDate(req.returnRequest.requestedAt)}</td>
                    <td className="px-2 py-1">
                      <a href={`/orders/${req.orderId}`}><Button size="sm">View Order</Button></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <Button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
} 