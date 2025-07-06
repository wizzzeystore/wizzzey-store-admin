"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Truck,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BrandDailyOrderItem, OrderPlacedBatch } from '@/types/ecommerce';
import { 
  getBrandDailyOrders, 
  submitBrandOrdersToPlaced, 
  getOrderPlacedBatches 
} from '@/lib/apiService';
import { PermissionGuard } from '@/components/PermissionGuard';

interface BrandOrdersPageProps {
  params: {
    id: string;
  };
}

export default function BrandOrdersPage({ params }: BrandOrdersPageProps) {
  const [dailyOrders, setDailyOrders] = useState<BrandDailyOrderItem[]>([]);
  const [orderPlacedBatches, setOrderPlacedBatches] = useState<OrderPlacedBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const { toast } = useToast();

  const brandId = params.id;

  const fetchDailyOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getBrandDailyOrders(brandId, selectedDate);
      if (response.type === 'OK' && response.data?.orders) {
        setDailyOrders(response.data.orders);
      } else {
        toast({ title: "Error", description: "Failed to fetch daily orders.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while fetching orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderPlacedBatches = async () => {
    try {
      const response = await getOrderPlacedBatches(brandId);
      if (response.type === 'OK' && response.data?.batches) {
        setOrderPlacedBatches(response.data.batches);
      }
    } catch (error) {
      console.error('Failed to fetch order placed batches:', error);
    }
  };

  useEffect(() => {
    fetchDailyOrders();
    fetchOrderPlacedBatches();
  }, [selectedDate, brandId]);

  const handleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSubmitToOrderPlaced = async () => {
    if (selectedOrders.length === 0) {
      toast({ title: "Warning", description: "Please select orders to submit.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await submitBrandOrdersToPlaced(brandId, selectedOrders);
      if (response.type === 'OK') {
        toast({ title: "Success", description: "Orders submitted to Order Placed successfully." });
        setSelectedOrders([]);
        fetchDailyOrders();
        fetchOrderPlacedBatches();
      } else {
        toast({ title: "Error", description: response.message || "Failed to submit orders.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while submitting orders.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderStats = () => {
    const totalOrders = dailyOrders.length;
    const outOfStockOrders = dailyOrders.filter(order => 
      order.items.some(item => item.quantity === 0)
    ).length;
    const totalItems = dailyOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const totalAmount = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return { totalOrders, outOfStockOrders, totalItems, totalAmount };
  };

  const stats = getOrderStats();

  return (
    <PermissionGuard permission="canManageOrders">
      <PageHeader
        title={`Brand ${params.id} Orders`}
        description="Manage daily orders and track order placement workflow."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchDailyOrders(); fetchOrderPlacedBatches(); }} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {selectedOrders.length > 0 && (
              <Button onClick={handleSubmitToOrderPlaced} disabled={isLoading}>
                <Package className="mr-2 h-4 w-4" />
                Submit to Order Placed ({selectedOrders.length})
              </Button>
            )}
          </div>
        }
      />

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.outOfStockOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily-orders">Daily Orders</TabsTrigger>
          <TabsTrigger value="order-placed">Order Placed</TabsTrigger>
        </TabsList>

        <TabsContent value="daily-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daily Orders - {selectedDate}</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading orders...</span>
                </div>
              ) : dailyOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedOrders.includes(order.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleOrderSelection(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => handleOrderSelection(order.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium">Order #{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {order.items.length} items
                          </Badge>
                          <Badge variant="default">
                            ₹{order.totalAmount.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{item.productName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Qty: {item.quantity}</span>
                              {item.quantity === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order-placed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Order Placed Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderPlacedBatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No order placed batches found.
                </div>
              ) : (
                <div className="space-y-4">
                  {orderPlacedBatches.map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Batch #{batch.id}</span>
                          <Badge variant="outline">
                            {batch.items.length} items
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {batch.submissionDate}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {batch.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>Order #{item.originalOrderId}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Items: {item.items.length}</span>
                              <span className="text-muted-foreground">₹{item.totalAmount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {batch.trackingId && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Tracking: {batch.trackingId}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t">
                        <Badge variant={
                          batch.deliveryStatus === 'Delivered' ? 'default' :
                          batch.deliveryStatus === 'Pending' ? 'secondary' :
                          'destructive'
                        }>
                          {batch.deliveryStatus || 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PermissionGuard>
  );
} 