// Based on OpenAPI specification components.schemas

export interface User {
  _id?: string; // uuid
  id?: string; // uuid (for backward compatibility)
  name: string;
  email: string; // email
  role: 'Admin' | 'Customer' | 'Moderator' | 'BrandPartner';
  assignedBrand?: {
    _id: string;
    name: string;
    slug: string;
  };
  permissions?: {
    canManageUsers: boolean;
    canManageProducts: boolean;
    canManageOrders: boolean;
    canManageInventory: boolean;
    canManageBrands: boolean;
    canViewAnalytics: boolean;
  };
  phone?: string;
  shippingAddress?: any;
  billingAddress?: any;
  isActive?: boolean;
  isVerified?: boolean;
  lastLogin?: string; // date-time
  lastOrderProcessed?: string; // date-time
  totalOrdersProcessed?: number;
  avatarUrl?: string; // uri
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
  password?: string; // Not in schema but likely for creation
}

export interface Media {
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

export interface Product {
  id: string; // uuid
  name: string;
  description: string;
  price: number;
  categoryId: string; // uuid
  brandId?: string; // uuid
  imageUrl?: string; // uri
  images?: string[]; // array of image URLs
  inStock: boolean;
  sku?: string;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  availableSizes?: string[];
  colors?: { name: string; code: string }[];
  weight?: { value: number; unit: 'g' | 'kg' | 'lb' | 'oz' };
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'm' | 'in' };
  tags?: string[];
  status?: 'draft' | 'active' | 'archived' | 'out_of_stock';
  isFeatured?: boolean;
  seo?: { title: string; description: string; keywords: string[] };
  ratings?: { average: number; count: number };
  barcode?: string;
  media?: { url: string; type: 'image' | 'video'; alt: string }[];
  sizeChart?: string | { _id: string; title: string }; // ObjectId reference to SizeChart or populated object
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Category {
  id: string; // uuid
  name: string;
  description?: string;
  parentId?: string | null; // uuid
  imageUrl?: string; // uri
  image?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  slug?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
  seo?: { title?: string; description?: string; keywords?: string[] };
  attributes?: CategoryAttribute[];
  media?: { url: string; type: 'image' | 'video'; alt?: string }[];
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}

export interface OrderItem {
  productId: string; // uuid
  sku?: string; // Added for Brand Orders display
  color?: string; // Added for Brand Orders display
  size?: string; // Added for Brand Orders display
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Order {
  id: string; // uuid
  customerId: string; // uuid
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface FAQ {
  id: string; // uuid
  question: string;
  answer: string;
  category: string;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface SizeChart {
  _id: string;
  title: string;
  description?: string;
  image: string;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Inventory {
  id: string; // uuid
  productId: string; // uuid
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  lastUpdated?: string; // date-time
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface AppSettings {
  _id?: string; // MongoDB ObjectId
  storeName: string;
  defaultStoreEmail: string;
  maintenanceMode: boolean;
  darkMode: boolean;
  themeAccentColor: string;
  storeLogoUrl: string;
  storeLogo?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  heroImage?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  heroImageMobile?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  footerImage?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  footerImageMobile?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  };
  footerText?: {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  announcementBar?: {
    enabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
  };
  notifications: {
    newOrderEmails: boolean;
    lowStockAlerts: boolean;
    productUpdatesNewsletter: boolean;
  };
  apiSettings: {
    apiKey?: string;
    apiKeyLastGenerated?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: string; // uuid
  userId: string; // uuid
  action: string;
  entityType: string;
  entityId: string; // uuid
  details?: object;
  createdAt?: string; // date-time
  user?: User; // For displaying user name (client-side enrichment)
}

export interface BlogPost {
  id: string; // uuid
  title: string;
  content: string;
  author: string; // uuid (User ID)
  authorName?: string; // For display
  tags?: string[];
  status: 'Draft' | 'Published' | 'Archived';
  featuredImage?: string; // uri
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface CustomerAddress {
  type: 'Billing' | 'Shipping';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Customer {
  id: string; // uuid
  userId?: string; // uuid
  firstName: string;
  lastName: string;
  email: string; // email
  phone?: string;
  addresses?: CustomerAddress[];
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface DiscountCode {
  id: string; // uuid
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string; // date-time
  endDate: string; // date-time
  isActive: boolean;
  usageLimit?: number;
  usageCount?: number;
  appliesTo?: 'All' | 'Products' | 'Categories';
  productIds?: string[]; // uuid array
  categoryIds?: string[]; // uuid array
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Notification {
  id: string; // uuid
  userId: string; // uuid
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  isRead: boolean;
  data?: object;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Brand {
  id: string; // uuid
  name: string;
  description?: string;
  logoUrl?: string; // uri
  website?: string; // uri
  isActive?: boolean;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

// Common API Response Structures
export interface ApiResponse<T = any> {
  type: 'OK' | 'ERROR' | 'SUCCESS'; // Added SUCCESS for the new dashboard stats
  message?: string;
  data?: T;
  meta?: { id?: string }; // uuid
}

export interface PaginatedResponse<TData = any, TKey extends string = string> extends ApiResponse {
  data?: {
    [K in TKey]?: TData[]; // e.g., products: Product[]
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters?: {
    applied?: Record<string, any>;
    available?: Record<string, any>;
  };
  sort?: {
    by: string;
    order: 'asc' | 'desc';
  };
}
// API Request Payloads (examples, more can be added as needed)
export interface LoginPayload {
  email: string;
  password?: string; // Password might not always be part of User schema for responses
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

// NEW TYPES FOR ENHANCEMENTS

export interface SoftInventoryItem {
  id: string; // uuid
  brandName: string;
  sku: string;
  size: string;
  color?: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
  lastUpdated: string; // date-time
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface HardInventoryItem {
  id: string; // uuid
  brandName: string;
  sku: string;
  size: string;
  color?: string;
  quantity: number;
  platform: 'amazon' | 'myntra' | 'flipkart' | 'nykaa' | 'other';
  platformSku?: string;
  platformProductId?: string;
  platformUrl?: string;
  platformPrice?: number;
  platformStatus: 'active' | 'inactive' | 'pending' | 'suspended';
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
  lastUpdated: string; // date-time
  lastSyncAt: string; // date-time
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface BrandDailyOrderItem {
  id: string; // This is the Order ID
  items: {
    productName: string;
    quantity: number;
  }[];
  totalAmount: number;
  rawOrderData?: OrderItem; 
}

export interface OrderPlacedBatchItem extends BrandDailyOrderItem {
  originalOrderId: string;
}
export interface OrderPlacedBatch {
  id: string; // uuid for the batch itself
  brandId: string;
  submissionDate: string; // date string "YYYY-MM-DD"
  items: OrderPlacedBatchItem[];
  trackingId?: string;
  deliveryStatus?: 'Pending' | 'Delivered' | 'Not Delivered' | 'Issue';
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

// Dashboard Stats Types
export interface TodayStats {
  orders: number;
  revenue: number;
  returns: number; // Added: today's return/exchange requests
}

export interface OverallStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalReturns: number; // Added: all-time return/exchange requests
}

export interface SalesOverviewItem {
  date: string; // "YYYY-MM-DD"
  revenue: number;
  orders: number;
}

export interface TopSellingProductItem {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardStatsData {
  todayStats: TodayStats;
  overallStats: OverallStats;
  salesOverview: SalesOverviewItem[];
  topSellingProducts: TopSellingProductItem[];
}

// Add Product `dataAiHint` property
export interface Product {
  // ... existing product properties
  dataAiHint?: string;
}

// Add Category `dataAiHint` property
export interface Category {
  // ... existing category properties
  dataAiHint?: string;
}

// Add Brand `dataAiHint` property
export interface Brand {
  // ... existing brand properties
  dataAiHint?: string;
}

// Add BlogPost `dataAiHint` property
export interface BlogPost {
  // ... existing blog post properties
  dataAiHint?: string;
}
