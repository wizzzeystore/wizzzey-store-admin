"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { Permissions } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: keyof Permissions;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback
}) => {
  const { user } = useAuth();

  if (!hasPermission(user, permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}; 