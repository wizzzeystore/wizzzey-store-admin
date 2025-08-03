import { User } from '@/types/ecommerce';

export interface Permissions {
  canManageUsers: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canManageBrands: boolean;
  canViewAnalytics: boolean;
  canManageReturnExchange: boolean;
}

export const hasPermission = (user: User | null, permission: keyof Permissions): boolean => {
  if (!user) return false;
  
  // If user has no permissions object, deny access
  if (!user.permissions) return false;
  
  return user.permissions[permission] === true;
};

export const requirePermission = (user: User | null, permission: keyof Permissions): boolean => {
  return hasPermission(user, permission);
};

// Permission check for specific features
export const canAccessOrders = (user: User | null): boolean => {
  return hasPermission(user, 'canManageOrders');
};

export const canAccessUsers = (user: User | null): boolean => {
  return hasPermission(user, 'canManageUsers');
};

export const canAccessProducts = (user: User | null): boolean => {
  return hasPermission(user, 'canManageProducts');
};

export const canAccessInventory = (user: User | null): boolean => {
  return hasPermission(user, 'canManageInventory');
};

export const canAccessBrands = (user: User | null): boolean => {
  return hasPermission(user, 'canManageBrands');
};

export const canAccessAnalytics = (user: User | null): boolean => {
  return hasPermission(user, 'canViewAnalytics');
}; 

export const canAccessReturns = (user: User | null): boolean => {
  return hasPermission(user, 'canManageReturnExchange');
};