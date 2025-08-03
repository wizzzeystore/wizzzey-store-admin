"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Upload } from 'lucide-react';
import { SizeChart } from '@/types/ecommerce';
import { getSizeCharts, createSizeChart, deleteSizeChart } from '@/lib/apiService';
import { SizeChartColumns } from './components/SizeChartColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { SizeChartForm } from './components/SizeChartForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function SizeChartsPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getSizeCharts(pagination.pageIndex + 1, pagination.pageSize);
      if (response.type === 'OK' && response.data?.sizeCharts) {
        setSizeCharts(response.data.sizeCharts);
        if (response.meta) {
          setPagination(prev => ({
            ...prev,
            pageCount: response.meta!.totalPages,
          }));
          setTotalCount(response.meta.total);
        }
      } else {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to fetch size charts.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An error occurred while fetching size charts.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true);
    try {
      const response = await createSizeChart(formData);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Size chart uploaded successfully." });
        setIsUploadDialogOpen(false);
        fetchData();
      } else {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to upload size chart.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An error occurred while uploading size chart.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteRequested = (sizeChartId: string) => {
    setItemToDeleteId(sizeChartId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteSizeChart(itemToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "Size chart deleted successfully." });
        fetchData();
      } else {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to delete size chart.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An error occurred while deleting size chart.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setItemToDeleteId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Size Charts"
        description="Manage size charts for your products."
        count={totalCount}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Size Chart
            </Button>
          </div>
        }
      />

      <DataTable
        columns={SizeChartColumns({ onDeleteRequested: handleDeleteRequested })}
        data={sizeCharts}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pagination.pageCount}
        filterColumn='title'
        filterPlaceholder='Filter size charts by title...'
      />

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Size Chart</DialogTitle>
          </DialogHeader>
          <SizeChartForm
            onSubmit={handleUpload}
            isLoading={isUploading}
            onCancel={() => setIsUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Size Chart"
        description="Are you sure you want to delete this size chart? This action cannot be undone."
      />
    </>
  );
} 