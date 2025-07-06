"use client";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/ecommerce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface UserColumnsProps {
  onEdit: (user: User) => void;
  onDeleteRequested: (userId: string) => void;
  onStatusToggleRequested: (userId: string) => void;
}

export const UserColumns = ({ onEdit, onDeleteRequested, onStatusToggleRequested }: UserColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <span className="text-sm text-muted-foreground">{user.email}</span>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const getRoleBadge = (role: string) => {
        switch (role) {
          case 'Admin':
            return <Badge variant="destructive">Admin</Badge>;
          case 'Moderator':
            return <Badge variant="secondary">Moderator</Badge>;
          case 'BrandPartner':
            return <Badge variant="outline">Brand Partner</Badge>;
          case 'Customer':
            return <Badge variant="default">Customer</Badge>;
          default:
            return <Badge variant="outline">{role}</Badge>;
        }
      };
      return getRoleBadge(role);
    },
  },
  {
    accessorKey: "assignedBrand",
    header: "Assigned Brand",
    cell: ({ row }) => {
      const assignedBrand = row.original.assignedBrand;
      if (!assignedBrand) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <Badge variant="outline">
          {assignedBrand.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="flex items-center gap-2">
          {isActive ? (
            <UserCheck className="h-4 w-4 text-green-600" />
          ) : (
            <UserX className="h-4 w-4 text-red-600" />
          )}
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone || <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLogin") as string;
      if (!lastLogin) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return format(new Date(lastLogin), "MMM dd, yyyy HH:mm");
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      if (!createdAt) {
        return <span className="text-muted-foreground">-</span>;
      }
      return format(new Date(createdAt), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onStatusToggleRequested(user.id || user._id || '')}
              className={user.isActive ? "text-red-600" : "text-green-600"}
            >
              {user.isActive ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteRequested(user.id || user._id || '')}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
