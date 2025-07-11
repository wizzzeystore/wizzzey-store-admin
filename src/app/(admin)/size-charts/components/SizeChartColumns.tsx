"use client";
import { ColumnDef } from "@tanstack/react-table";
import { SizeChart } from "@/types/ecommerce";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SizeChartColumnsProps {
  onDeleteRequested: (id: string) => void;
  onViewRequested?: (id: string) => void;
}

export const SizeChartColumns = ({ 
  onDeleteRequested, 
  onViewRequested 
}: SizeChartColumnsProps): ColumnDef<SizeChart>[] => [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const sizeChart = row.original;
      return (
        <div className="flex items-center">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${sizeChart.image}`}
            alt={sizeChart.title}
            className="w-16 h-16 object-contain border rounded"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("title")}</div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {description || "No description"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-gray-500">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sizeChart = row.original;
      return (
        <div className="flex items-center gap-2">
          {onViewRequested && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRequested(sizeChart._id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteRequested(sizeChart._id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]; 