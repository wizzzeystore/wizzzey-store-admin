"use client";
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { User } from '@/types/ecommerce';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  getUserStats,
  getUsersByRole
} from '@/lib/apiService';
import { UserColumns } from './components/UserColumns';
import { DataTable } from '@/app/(admin)/products/components/data-table';
import { useToast } from '@/hooks/use-toast';
import UserFormDialog from './components/UserFormDialog';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionGuard } from '@/components/PermissionGuard';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, pageCount: 1 });
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [isConfirmStatusDialogOpen, setIsConfirmStatusDialogOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
  const [userToToggleId, setUserToToggleId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let response;
      if (selectedRole === 'all') {
        response = await getUsers(pagination.pageIndex + 1, pagination.pageSize);
      } else {
        response = await getUsersByRole(selectedRole, pagination.pageIndex + 1, pagination.pageSize);
      }

      if (response.type === 'OK' && response.data?.users) {
        setUsers(response.data.users);
        if (response.meta) {
          setPagination(prev => ({
            ...prev,
            pageCount: response.meta!.totalPages,
          }));
          setTotalCount(response.meta.total);
        }
      } else {
        toast({ title: "Error", description: response.message || "Failed to fetch users.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while fetching users.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      if (response.type === 'OK' && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, selectedRole]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsFormDialogOpen(true);
  };

  const handleFormDialogClose = (refresh?: boolean) => {
    setIsFormDialogOpen(false);
    setEditingUser(null);
    if (refresh) {
      fetchData();
      fetchStats();
    }
  };

  const handleDeleteRequested = (userId: string) => {
    setUserToDeleteId(userId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleStatusToggleRequested = (userId: string) => {
    setUserToToggleId(userId);
    setIsConfirmStatusDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDeleteId) return;
    setIsLoading(true);
    try {
      const response = await deleteUser(userToDeleteId);
      if (response.type === "OK") {
        toast({ title: "Success", description: "User deleted successfully." });
        fetchData();
        fetchStats();
      } else {
        toast({ title: "Error", description: response.message || "Failed to delete user.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setUserToDeleteId(null);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!userToToggleId) return;
    setIsLoading(true);
    try {
      const response = await toggleUserStatus(userToToggleId);
      if (response.type === "OK") {
        const user = users.find(u => u.id === userToToggleId);
        const status = user?.isActive ? 'deactivated' : 'activated';
        toast({ title: "Success", description: `User ${status} successfully.` });
        fetchData();
        fetchStats();
      } else {
        toast({ title: "Error", description: response.message || "Failed to update user status.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsConfirmStatusDialogOpen(false);
      setUserToToggleId(null);
    }
  };

  const handleRoleFilterChange = (role: string) => {
    setSelectedRole(role);
    setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset to first page
  };

  const getRoleStats = (role: string) => {
    if (!stats?.stats) return { count: 0, activeCount: 0 };
    const roleStat = stats.stats.find((s: any) => s._id === role);
    return roleStat || { count: 0, activeCount: 0 };
  };

  return (
    <PermissionGuard permission="canManageUsers">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions across the platform."
        count={totalCount}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchData(); fetchStats(); }} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        }
      />

      {/* User Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleStats('Admin').count}</div>
              <p className="text-xs text-muted-foreground">
                {getRoleStats('Admin').activeCount} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderators</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleStats('Moderator').count}</div>
              <p className="text-xs text-muted-foreground">
                {getRoleStats('Moderator').activeCount} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brand Partners</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleStats('BrandPartner').count}</div>
              <p className="text-xs text-muted-foreground">
                {getRoleStats('BrandPartner').activeCount} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRoleStats('Customer').count}</div>
              <p className="text-xs text-muted-foreground">
                {getRoleStats('Customer').activeCount} active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Role:</label>
          <Select value={selectedRole} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Administrators</SelectItem>
              <SelectItem value="Moderator">Moderators</SelectItem>
              <SelectItem value="BrandPartner">Brand Partners</SelectItem>
              <SelectItem value="Customer">Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={UserColumns({ 
          onEdit: handleEdit, 
          onDeleteRequested: handleDeleteRequested,
          onStatusToggleRequested: handleStatusToggleRequested
        })}
        data={users}
        isLoading={isLoading}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pagination.pageCount}
        filterColumn='email'
        filterPlaceholder='Filter by email...'
      />

      <UserFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormDialogClose}
        user={editingUser}
      />

      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />

      <ConfirmationDialog
        isOpen={isConfirmStatusDialogOpen}
        onClose={() => setIsConfirmStatusDialogOpen(false)}
        onConfirm={handleConfirmStatusToggle}
        title="Toggle User Status"
        description="Are you sure you want to change this user's active status?"
      />
    </PermissionGuard>
  );
}
