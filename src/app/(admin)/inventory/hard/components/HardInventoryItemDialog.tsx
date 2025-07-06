"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardInventoryItem } from "@/types/ecommerce";
import { useToast } from "@/hooks/use-toast";
import { createHardInventoryItem, updateHardInventoryItem } from "@/lib/apiService";
import React, { useEffect, useState } from "react";

const hardInventorySchema = z.object({
  brandName: z.string().min(1, "Brand Name is required."),
  sku: z.string().min(1, "SKU is required."),
  size: z.string().min(1, "Size is required."),
  color: z.string().optional(),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative."),
  platform: z.enum(['amazon', 'myntra', 'flipkart', 'nykaa', 'other'], {
    required_error: "Platform is required.",
  }),
  platformSku: z.string().optional(),
  platformProductId: z.string().optional(),
  platformUrl: z.string().url().optional().or(z.literal('')),
  platformPrice: z.coerce.number().min(0, "Price must be non-negative.").optional(),
  platformStatus: z.enum(['active', 'inactive', 'pending', 'suspended']).default('active'),
});

type HardInventoryFormValues = z.infer<typeof hardInventorySchema>;

interface HardInventoryItemDialogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  itemData?: HardInventoryItem | null;
}

const PLATFORMS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'myntra', label: 'Myntra' },
  { value: 'flipkart', label: 'Flipkart' },
  { value: 'nykaa', label: 'Nykaa' },
  { value: 'other', label: 'Other' }
];

const PLATFORM_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
];

export default function HardInventoryItemDialog({ isOpen, onClose, itemData }: HardInventoryItemDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HardInventoryFormValues>({
    resolver: zodResolver(hardInventorySchema),
    defaultValues: {
      brandName: "",
      sku: "",
      size: "",
      color: "",
      quantity: 0,
      platform: 'amazon',
      platformSku: "",
      platformProductId: "",
      platformUrl: "",
      platformPrice: 0,
      platformStatus: 'active',
    },
  });
  
  useEffect(() => {
    if (itemData && isOpen) {
      form.reset({
        brandName: itemData.brandName,
        sku: itemData.sku,
        size: itemData.size,
        color: itemData.color || "",
        quantity: itemData.quantity,
        platform: itemData.platform,
        platformSku: itemData.platformSku || "",
        platformProductId: itemData.platformProductId || "",
        platformUrl: itemData.platformUrl || "",
        platformPrice: itemData.platformPrice || 0,
        platformStatus: itemData.platformStatus,
      });
    } else if (!itemData && isOpen) {
      form.reset({
        brandName: "",
        sku: "",
        size: "",
        color: "",
        quantity: 0,
        platform: 'amazon',
        platformSku: "",
        platformProductId: "",
        platformUrl: "",
        platformPrice: 0,
        platformStatus: 'active',
      });
    }
  }, [itemData, form, isOpen]);

  const onSubmit = async (values: HardInventoryFormValues) => {
    setIsLoading(true);
    try {
      let response;
      if (itemData) {
        response = await updateHardInventoryItem(itemData.id, values);
      } else {
        response = await createHardInventoryItem(values);
      }

      if (response.type === "OK") {
        toast({ title: "Success", description: `Hard Inventory item ${itemData ? 'updated' : 'added'} successfully.` });
        onClose(true); 
      } else {
        toast({ title: "Error", description: response.message || "An error occurred.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{itemData ? "Edit Hard Inventory Item" : "Add New Hard Inventory Item"}</DialogTitle>
          <DialogDescription>
            {itemData ? "Update details for this hard inventory item." : "Fill in the details for the new hard inventory item."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl><Input placeholder="e.g., TechCorp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input placeholder="e.g., SPX-001-BLK-M" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl><Input placeholder="e.g., M, L, 10 inches" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Black, Red" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platformSku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform SKU (Optional)</FormLabel>
                    <FormControl><Input placeholder="Platform-specific SKU" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platformProductId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Product ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="Platform product ID" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="platformUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform URL (Optional)</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platformPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Price (Optional)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platformStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLATFORM_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? (itemData ? 'Updating...' : 'Adding...') : (itemData ? 'Save Changes' : 'Add Item')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 