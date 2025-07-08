import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Order, OrderStatus } from '@/types/order';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useOrders } from '@/hooks/use-orders';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
};

export function OrdersTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useOrders({
    page,
    limit,
    sortBy,
    sortOrder,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading orders. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search orders..."
            className="max-w-sm"
            // TODO: Implement search functionality
          />
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('id')}
                  className="font-semibold"
                >
                  Order ID
                  {sortBy === 'id' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('customerInfo.name')}
                  className="font-semibold"
                >
                  Customer
                  {sortBy === 'customerInfo.name' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('totalAmount')}
                  className="font-semibold"
                >
                  Total
                  {sortBy === 'totalAmount' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('status')}
                  className="font-semibold"
                >
                  Status
                  {sortBy === 'status' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                  className="font-semibold"
                >
                  Date
                  {sortBy === 'createdAt' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[60px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              data?.data.orders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerInfo.name}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      className={statusColors[order.status]}
                      variant="secondary"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Items Table (Product Details) */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Order Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.orders.map((order: Order) => (
              order.items.map((item, idx) => (
                <TableRow key={order.id + '-' + item.productId + '-' + idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img src={item.productImage || 'https://placehold.co/60x60.png'} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                      <a
                        href={`${process.env.NEXT_PUBLIC_STORE_URL}/shop/product/${item.productId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        {item.productName}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{item.sku || '-'}</TableCell>
                  <TableCell>{item.selectedSize || '-'}</TableCell>
                  <TableCell>{item.selectedColor || '-'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </div>

      {data && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to{' '}
            {Math.min(page * limit, data.meta.total)} of {data.meta.total} orders
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 