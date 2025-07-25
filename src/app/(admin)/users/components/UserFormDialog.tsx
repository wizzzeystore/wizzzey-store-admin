"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Brand } from '@/types/ecommerce';
import { createUser, updateUser, getBrands } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  user?: User | null;
}

export default function UserFormDialog({ isOpen, onClose, user }: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Customer' as 'Admin' | 'Customer' | 'Moderator' | 'BrandPartner',
    assignedBrand: { _id: '', name: '', slug: '' } as { _id: string; name: string; slug: string } | undefined,
    phone: '',
    isActive: true,
    permissions: {
      canManageUsers: false,
      canManageProducts: false,
      canManageOrders: false,
      canManageInventory: false,
      canManageBrands: false,
      canViewAnalytics: false,
      canManageReturnExchange: false
    }
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          role: user.role || 'Customer',
          assignedBrand: user.assignedBrand || { _id: '', name: '', slug: '' },
          phone: user.phone || '',
          isActive: user.isActive ?? true,
          permissions: user.permissions || {
            canManageUsers: false,
            canManageProducts: false,
            canManageOrders: false,
            canManageInventory: false,
            canManageBrands: false,
            canViewAnalytics: false,
            canManageReturnExchange: false
          }
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Customer',
          assignedBrand: { _id: '', name: '', slug: '' },
          phone: '',
          isActive: true,
          permissions: {
            canManageUsers: false,
            canManageProducts: false,
            canManageOrders: false,
            canManageInventory: false,
            canManageBrands: false,
            canViewAnalytics: false,
            canManageReturnExchange: false
          }
        });
      }
    }
  }, [isOpen, user]);

  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const response = await getBrands(1, 100);
      if (response.type === 'OK' && response.data?.brands) {
        setBrands(response.data.brands);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        assignedBrand: formData.assignedBrand || undefined
      };

      let response;
      if (user) {
        // Update existing user
        response = await updateUser(user.id || user._id || '', submitData);
      } else {
        // Create new user
        if (!submitData.password) {
          toast({ title: "Error", description: "Password is required for new users.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        response = await createUser(submitData);
      }

      if (response.type === 'OK') {
        toast({ 
          title: "Success", 
          description: user ? "User updated successfully." : "User created successfully." 
        });
        onClose(true);
      } else {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to save user.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "An error occurred while saving the user.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'Admin':
        return {
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageInventory: true,
          canManageBrands: true,
          canViewAnalytics: true,
          canManageReturnExchange: true
        };
      case 'Moderator':
        return {
          canManageUsers: false,
          canManageProducts: true,
          canManageOrders: true,
          canManageInventory: true,
          canManageBrands: false,
          canViewAnalytics: true,
          canManageReturnExchange: false
        };
      case 'BrandPartner':
        return {
          canManageUsers: false,
          canManageProducts: false,
          canManageOrders: true,
          canManageInventory: false,
          canManageBrands: false,
          canViewAnalytics: false,
          canManageReturnExchange: false
        };
      case 'Customer':
        return {
          canManageUsers: false,
          canManageProducts: false,
          canManageOrders: false,
          canManageInventory: false,
          canManageBrands: false,
          canViewAnalytics: false,
          canManageReturnExchange: false
        };
      default:
        return {
          canManageUsers: false,
          canManageProducts: false,
          canManageOrders: false,
          canManageInventory: false,
          canManageBrands: false,
          canViewAnalytics: false,
          canManageReturnExchange: false
        };
    }
  };

  const handleRoleChange = (role: string) => {
    const permissions = getRolePermissions(role);
    setFormData(prev => ({
      ...prev,
      role: role as 'Admin' | 'Customer' | 'Moderator' | 'BrandPartner',
      permissions
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!user && '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required={!user}
                placeholder={user ? "Leave blank to keep current password" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="BrandPartner">Brand Partner</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedBrand">
                Assigned Brand {formData.role === 'BrandPartner' && '*'}
              </Label>
              <Select 
                value={formData.assignedBrand ? formData.assignedBrand._id : "none"} 
                onValueChange={(value) => handleInputChange('assignedBrand', value === "none" ? undefined : { _id: value, name: '', slug: '' })}
                disabled={isLoadingBrands}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Brand Assigned</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Account</Label>
            </div>
          </div>

          {/* Permissions Section - Only show for Admin role */}
          {formData.role === 'Admin' && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageUsers"
                    checked={!!formData.permissions.canManageUsers}
                    onCheckedChange={(checked) => handlePermissionChange('canManageUsers', checked)}
                  />
                  <Label htmlFor="canManageUsers">Manage Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageProducts"
                    checked={!!formData.permissions.canManageProducts}
                    onCheckedChange={(checked) => handlePermissionChange('canManageProducts', checked)}
                  />
                  <Label htmlFor="canManageProducts">Manage Products</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageOrders"
                    checked={!!formData.permissions.canManageOrders}
                    onCheckedChange={(checked) => handlePermissionChange('canManageOrders', checked)}
                  />
                  <Label htmlFor="canManageOrders">Manage Orders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageInventory"
                    checked={!!formData.permissions.canManageInventory}
                    onCheckedChange={(checked) => handlePermissionChange('canManageInventory', checked)}
                  />
                  <Label htmlFor="canManageInventory">Manage Inventory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageBrands"
                    checked={!!formData.permissions.canManageBrands}
                    onCheckedChange={(checked) => handlePermissionChange('canManageBrands', checked)}
                  />
                  <Label htmlFor="canManageBrands">Manage Brands</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canViewAnalytics"
                    checked={!!formData.permissions.canViewAnalytics}
                    onCheckedChange={(checked) => handlePermissionChange('canViewAnalytics', checked)}
                  />
                  <Label htmlFor="canViewAnalytics">View Analytics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="canManageReturnExchange"
                    checked={!!formData.permissions.canManageReturnExchange}
                    onCheckedChange={(checked) => handlePermissionChange('canManageReturnExchange', checked)}
                  />
                  <Label htmlFor="canManageReturnExchange">Manage Returns/Exchange</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
