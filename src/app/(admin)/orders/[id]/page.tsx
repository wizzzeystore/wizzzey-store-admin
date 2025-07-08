'use client';

import { use } from 'react';
import PageHeader from '@/components/PageHeader';
import { useOrder } from '@/hooks/use-orders';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { OrderStatus } from '@/types/order';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateOrder, deleteOrder, fetchOrderReturns, updateOrderReturnRequest } from '@/lib/apiService';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
};

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || '';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error, refetch } = useOrder(id as string);
  const { toast } = useToast();
  const router = useRouter();

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<OrderStatus | ''>('');
  const [editNotes, setEditNotes] = useState<string>('');
  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  // Returns/Exchanges state
  const [returns, setReturns] = useState<any[]>([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingReturn, setUpdatingReturn] = useState(false);

  useEffect(() => {
    fetchOrderReturns(id).then(setReturns).catch(() => setReturns([]));
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-4 text-center text-red-500">
          Error loading order details. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  const order = data?.data.order;

  if (!order) {
    return (
      <div className="container mx-auto py-6">
        <BackButton defaultHref="/orders" />
        <div className="mt-4 text-center text-muted-foreground">
          Order not found.
        </div>
      </div>
    );
  }

  // Handlers
  const handleEditOpen = () => {
    setEditStatus(order.status as OrderStatus);
    setEditNotes(order.notes || '');
    setEditOpen(true);
  };
  const handleEditSave = async () => {
    setUpdating(true);
    const res = await updateOrder(order.id, { status: editStatus as OrderStatus, notes: editNotes });
    setUpdating(false);
    if (res.type === 'OK') {
      toast({ title: 'Order updated', description: 'Order updated successfully.' });
      setEditOpen(false);
      refetch && refetch();
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to update order.', variant: 'destructive' });
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteOrder(order.id);
    setDeleting(false);
    if (res.type === 'OK') {
      toast({ title: 'Order deleted', description: 'Order deleted successfully.' });
      setDeleteOpen(false);
      router.push('/orders');
    } else {
      toast({ title: 'Error', description: res.message || 'Failed to delete order.', variant: 'destructive' });
    }
  };

  const handleOpenReturnDialog = (ret: any) => {
    setSelectedReturn(ret);
    setAdminStatus(ret.status);
    setAdminNotes(ret.adminNotes || '');
    setReturnDialogOpen(true);
  };

  const handleUpdateReturn = async () => {
    setUpdatingReturn(true);
    try {
      await updateOrderReturnRequest(order.id, selectedReturn._id, { status: adminStatus, adminNotes });
      setReturnDialogOpen(false);
      // Refresh returns
      const updated = await fetchOrderReturns(order.id);
      setReturns(updated);
      toast({ title: 'Return/Exchange updated' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update return/exchange', variant: 'destructive' });
    } finally {
      setUpdatingReturn(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <BackButton defaultHref="/orders" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditOpen}>Edit</Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Coming soon',
                description: 'Print functionality will be available soon.',
              });
            }}
          >
            Print Order
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Coming soon',
                description: 'Export functionality will be available soon.',
              });
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium">Status</label>
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <label className="block text-sm font-medium">Notes</label>
            <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={updating}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this order? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title={`Order #${order.id}`}
        description={`Placed on ${formatDate(order.createdAt)}`}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span>{' '}
              {order.customerInfo.name}
            </div>
            <div>
              <span className="font-medium">Email:</span>{' '}
              {order.customerInfo.email}
            </div>
            {order.customerInfo.phone && (
              <div>
                <span className="font-medium">Phone:</span>{' '}
                {order.customerInfo.phone}
              </div>
            )}
            <div>
              <span className="font-medium">Shipping Address:</span>{' '}
              {order.customerInfo.shippingAddress}
            </div>
            {order.customerInfo.billingAddress && (
              <div>
                <span className="font-medium">Billing Address:</span>{' '}
                {order.customerInfo.billingAddress}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge
                className={statusColors[order.status]}
                variant="secondary"
              >
                {order.status}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Order Date:</span>{' '}
              {formatDate(order.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {formatDate(order.updatedAt)}
            </div>
            <div>
              <span className="font-medium">Total Amount:</span>{' '}
              {formatCurrency(order.totalAmount)}
            </div>
            {order.notes && (
              <div>
                <span className="font-medium">Notes:</span>{' '}
                {order.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Color</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`} className="border-b">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <img src={item.productImage || 'https://placehold.co/60x60.png'} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                        <a
                          href={`${STORE_URL}/shop/product/${item.productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          {item.productName}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.sku || '-'}</td>
                    <td className="px-4 py-2">{item.selectedSize || '-'}</td>
                    <td className="px-4 py-2">{item.selectedColor || '-'}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{formatCurrency(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns/Exchanges Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Returns / Exchanges</CardTitle>
        </CardHeader>
        <CardContent>
          {returns.length === 0 ? (
            <div className="text-muted-foreground">No return or exchange requests for this order.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Reason</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Requested At</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Exchange For</th>
                    <th className="px-4 py-2 text-left">Admin Notes</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((ret, idx) => {
                    const item = order.items.find(i => i.productId === ret.itemId);
                    return (
                      <tr key={ret._id || idx} className="border-b">
                        <td className="px-4 py-2">
                          {item ? (
                            <div className="flex items-center gap-2">
                              <img src={item.productImage || 'https://placehold.co/60x60.png'} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                              <span>{item.productName}</span>
                              {item.sku && (
                                <span className="ml-2 text-xs text-muted-foreground">SKU: {item.sku}</span>
                              )}
                            </div>
                          ) : ret.itemId}
                        </td>
                        <td className="px-4 py-2">{ret.type}</td>
                        <td className="px-4 py-2">{ret.reason}</td>
                        <td className="px-4 py-2">{ret.status}</td>
                        <td className="px-4 py-2">{ret.requestedAt ? new Date(ret.requestedAt).toLocaleString() : '-'}</td>
                        <td className="px-4 py-2">{ret.quantity}</td>
                        <td className="px-4 py-2">{ret.type === 'exchange' ? `${ret.exchangeForSize || ''} ${ret.exchangeForColor || ''}` : '-'}</td>
                        <td className="px-4 py-2">{ret.adminNotes || '-'}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenReturnDialog(ret)}>
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return/Exchange Update Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Return/Exchange</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={adminStatus} onValueChange={setAdminStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Admin notes (optional)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)} disabled={updatingReturn}>Cancel</Button>
            <Button onClick={handleUpdateReturn} disabled={updatingReturn}>
              {updatingReturn ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 