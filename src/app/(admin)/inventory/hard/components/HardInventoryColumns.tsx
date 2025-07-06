"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { HardInventoryItem } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";

interface HardInventoryColumnsProps {
  onEdit: (item: HardInventoryItem) => void;
  onDeleteRequested: (itemId: string) => void;
}

export const HardInventoryColumns = ({ onEdit, onDeleteRequested }: HardInventoryColumnsProps): ColumnDef<HardInventoryItem>[] => {
  
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "brandName", 
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Brand Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => row.getValue("color") || "-",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => `${row.getValue("quantity")} units`,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => {
      const platform = row.getValue("platform") as string;
      const getPlatformColor = (platform: string) => {
        switch (platform) {
          case 'amazon': return 'text-orange-600 bg-orange-100';
          case 'myntra': return 'text-pink-600 bg-pink-100';
          case 'flipkart': return 'text-blue-600 bg-blue-100';
          case 'nykaa': return 'text-purple-600 bg-purple-100';
          default: return 'text-gray-600 bg-gray-100';
        }
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(platform)}`}>
          {platform.toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "platformSku",
    header: "Platform SKU",
    cell: ({ row }) => row.getValue("platformSku") || "-",
  },
  {
    accessorKey: "platformPrice",
    header: "Platform Price",
    cell: ({ row }) => {
      const price = row.getValue("platformPrice") as number;
      return price ? `₹${price.toFixed(2)}` : "-";
    },
  },
  {
    accessorKey: "platformStatus",
    header: "Platform Status",
    cell: ({ row }) => {
      const status = row.getValue("platformStatus") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active': return 'text-green-600 bg-green-100';
          case 'inactive': return 'text-gray-600 bg-gray-100';
          case 'pending': return 'text-yellow-600 bg-yellow-100';
          case 'suspended': return 'text-red-600 bg-red-100';
          default: return 'text-gray-600 bg-gray-100';
        }
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Stock Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'in_stock': return 'text-green-600 bg-green-100';
          case 'low_stock': return 'text-yellow-600 bg-yellow-100';
          case 'out_of_stock': return 'text-red-600 bg-red-100';
          default: return 'text-gray-600 bg-gray-100';
        }
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => new Date(row.getValue("lastUpdated") as string).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            {item.platformUrl && (
              <DropdownMenuItem onClick={() => window.open(item.platformUrl, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" /> View on Platform
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDeleteRequested(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]}; 