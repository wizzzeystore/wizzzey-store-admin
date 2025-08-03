'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useOrders } from '@/hooks/use-orders';

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data } = useOrders({
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const totalCount = data?.meta?.total || 0;

  return (
    <PermissionGuard permission="canManageOrders">
      <PageHeader
        title="Orders"
        description="View and manage customer orders."
        count={totalCount}
      />
      <div className="container mx-auto py-6">
        <OrdersTable />
      </div>
    </PermissionGuard>
  );
}
