"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Filter } from 'lucide-react';
import { HardInventoryItem } from '@/types/ecommerce';
import { 
  getHardInventoryItems, 
  createHardInventoryItem, 
  deleteHardInventoryItem, 
  updateHardInventoryItem,
  getHardInventoryByPlatform,
  syncPlatformData
} from '@/lib/apiService';
import { HardInventoryColumns } from './components/HardInventoryColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table'; 
import { useToast } from '@/hooks/use-toast';
import HardInventoryItemDialog from './components/HardInventoryItemDialog';
import BackButton from '@/components/BackButton';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PLATFORMS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'myntra', label: 'Myntra' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'nykaa', label: 'Nykaa' },
  { value: 'other', label: 'Other' }
];

export default function HardInventoryPage() {
  const [hardInventory, setHardInventory] = useState<HardInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HardInventoryItem | null>(null); 
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let response;
      if (selectedPlatform !== 'all') {
        response = await getHardInventoryByPlatform(selectedPlatform, pagination.pageIndex + 1, pagination.pageSize);
      } else {
        response = await getHardInventoryItems(pagination.pageIndex + 1, pagination.pageSize, filters);
      }
      
      console.log('Hard Inventory API Response:', response); // Debug log
      
      if (response.type === 'OK' && response.data?.hardInventoryItems) {
        setHardInventory(response.data.hardInventoryItems);
        if (response.meta) {
          setPagination(prev => ({ ...prev, pageCount: response.meta!.totalPages }));
        }
        // Show success toast for empty results
        if (response.data.hardInventoryItems.length === 0) {
          toast({ title: "Success", description: "No hard inventory items found." });
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch hard inventory.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while fetching hard inventory.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, selectedPlatform, filters]);

  const handleAddNew = () => {
    setEditingItem(null); 
    setIsFormDialogOpen(true);
  };
  
  const handleFormDialogClose = (refresh?: boolean) => {
    setIsFormDialogOpen(false);
    setEditingItem(null);
    if (refresh) {
      fetchData(); 
    }
  };
  
  const handleEdit = (item: HardInventoryItem) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
  };

  const handleDeleteRequested = (itemId: string) => {
    setItemToDeleteId(itemId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteHardInventoryItem(itemToDeleteId);
      if (response.type === 'OK') {
        toast({ title: "Success", description: "Item deleted successfully." });
        fetchData(); 
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete item.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const handleSyncPlatform = async (platform: string) => {
    setIsLoading(true);
    try {
      // This would typically sync with the actual platform API
      const response = await syncPlatformData(platform, []);
      if (response.type === 'OK') {
        toast({ title: "Success", description: `Platform ${platform} synced successfully.` });
        fetchData();
      } else {
        toast({ title: "Error", description: response.message || "Failed to sync platform.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred during sync.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackButton defaultHref="/inventory" />
      <PageHeader
        title="Hard Inventory Management"
        description="Manage stock for external platforms (Amazon, Myntra, Flipkart, etc.)."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        }
      />

      {/* Platform Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Platform Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Platform:</span>
            </div>
            <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlatform !== 'all' && (
              <Button 
                variant="outline" 
                onClick={() => handleSyncPlatform(selectedPlatform)}
                disabled={isLoading}
              >
                Sync {PLATFORMS.find(p => p.value === selectedPlatform)?.label}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={HardInventoryColumns({ onEdit: handleEdit, onDeleteRequested: handleDeleteRequested })}
        data={hardInventory}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pagination.pageCount}
        filterColumn='sku'
        filterPlaceholder='Filter by SKU...'
      />

      <HardInventoryItemDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormDialogClose}
        itemData={editingItem} 
      />

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Hard Inventory Item"
        description="Are you sure you want to delete this item?"
      />
    </>
  );
}

    