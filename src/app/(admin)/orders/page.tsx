'use client';

import PageHeader from '@/components/PageHeader';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { PermissionGuard } from '@/components/PermissionGuard';

export default function OrdersPage() {
  return (
    <PermissionGuard permission="canManageOrders">
      <PageHeader
        title="Orders"
        description="View and manage customer orders."
      />
      <div className="container mx-auto py-6">
        <OrdersTable />
      </div>
    </PermissionGuard>
  );
}
