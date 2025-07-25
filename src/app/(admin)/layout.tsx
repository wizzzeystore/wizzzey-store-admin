
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/AppLogo';
import { UserNav } from '@/components/UserNav';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessOrders, canAccessUsers, canAccessProducts, canAccessInventory, canAccessBrands, canAccessAnalytics, canAccessReturns } from '@/lib/permissions';
import {
  LayoutDashboard, ShoppingBag, Users, Settings, ListOrdered, Activity, BarChart3,
  Users2, ShoppingCart, PercentSquare, Newspaper, MessageSquareQuote, Briefcase, Palette, HardDrive, Warehouse, Trash2,
  ReceiptPoundSterling
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavItem[];
  exact?: boolean;
}

const getNavItems = (user: any): NavItem[] => {
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  ];

  if (canAccessProducts(user)) {
    items.push({ href: '/products', label: 'Products', icon: ShoppingBag });
  }

  items.push({ href: '/categories', label: 'Categories', icon: Briefcase });

  if (canAccessBrands(user)) {
    items.push({ href: '/brands', label: 'Brands', icon: Palette });
  }

  if (canAccessInventory(user)) {
    items.push({ href: '/inventory', label: 'Inventory', icon: Warehouse });
  }

  if (canAccessOrders(user)) {
    items.push({ href: '/orders', label: 'Orders', icon: ShoppingCart });
  }

  if (canAccessReturns(user)) {
    items.push({ href: '/return-exchange-orders', label: 'Return/Exchange', icon: ReceiptPoundSterling });
  }

  items.push({ href: '/customers', label: 'Customers', icon: Users2 });
  items.push({ href: '/discounts', label: 'Discounts', icon: PercentSquare });
  // Add Size Charts menu item here
  items.push({ href: '/size-charts', label: 'Size Charts', icon: ListOrdered });

  items.push({
    href: '/blogs', label: 'Blogs', icon: Newspaper, subItems: [
      { href: '/blogs', label: 'Manage Posts', icon: Newspaper, exact: true },
      { href: '/blogs/seo-optimizer', label: 'SEO Optimizer', icon: BarChart3 },
    ]
  });

  items.push({ href: '/faqs', label: 'FAQs', icon: MessageSquareQuote });

  if (canAccessUsers(user)) {
    items.push({ href: '/users', label: 'User Management', icon: Users });
  }

  items.push({ href: '/activity-logs', label: 'Activity Logs', icon: Activity });
  items.push({ href: '/cleanup', label: 'File Cleanup', icon: Trash2 });
  items.push({ href: '/settings', label: 'Settings', icon: Settings });

  return items;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <AppLogo width={80} height={80} />
          <p className="text-lg text-muted-foreground">Loading Wizzzey...</p>
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }
  
  const navItems = getNavItems(user);
  
  const renderNavItems = (items: NavItem[], isSubMenu = false) => {
    return items.map((item) => {
      const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  
      return (
        <SidebarMenuItem key={item.href}>
          {isSubMenu ? (
            // Link will render the <a> tag
            <Link href={item.href}>
              {/* SidebarMenuSubButton now renders a span for styling, inside the Link's <a> */}
              <SidebarMenuSubButton isActive={isActive} className="w-full justify-start">
                <span className="flex items-center w-full">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate ml-2">{item.label}</span>
                </span>
              </SidebarMenuSubButton>
            </Link>
          ) : (
            // Link renders the <a>, SidebarMenuButton renders a <button> (or slot if asChild)
            <Link href={item.href}>
              <SidebarMenuButton isActive={isActive} className="w-full justify-start">
                <item.icon className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          )}
          {item.subItems && isActive && ( 
            <SidebarMenuSub>
              {renderNavItems(item.subItems, true)}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    });
  };


  return (
    <SidebarProvider defaultOpen>
      <div className="w-full flex min-h-screen bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <Link href="/dashboard">
              <AppLogo />
            </Link>
          </SidebarHeader>
          <ScrollArea className="h-[calc(100vh-120px)]"> {}
            <SidebarContent className="p-2">
              <SidebarMenu>
                {renderNavItems(navItems)}
              </SidebarMenu>
            </SidebarContent>
          </ScrollArea>
          <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
            {}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {}
            </div>
            <UserNav />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
