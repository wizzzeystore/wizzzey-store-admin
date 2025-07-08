// This is an API service that makes actual HTTP requests.
import type {
  Product,
  Category,
  Brand,
  Inventory,
  FAQ,
  PaginatedResponse,
  ApiResponse,
  User,
  Order,
  Customer,
  DiscountCode,
  BlogPost,
  ActivityLog,
  AppSettings,
  LoginPayload,
  SoftInventoryItem,
  HardInventoryItem, 
  BrandDailyOrderItem, 
  OrderPlacedBatch,
  DashboardStatsData, 
} from '@/types/ecommerce';
import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_DISCOUNTS, MOCK_BLOG_POSTS, MOCK_ACTIVITY_LOGS, MOCK_APP_SETTINGS } from '@/lib/mockData'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/api';

// Helper function to simulate API delay - can be removed for real API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch function
async function fetchApi<T>(endpoint: string, options?: RequestInit, isFormData: boolean = false): Promise<T> {
  await delay(100);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && endpoint !== 'auth/login' && endpoint !== 'auth/register') { 
    headers['Authorization'] = `Bearer ${token}`;
  }


  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || 'API request failed with non-JSON response' };
      }
      return { type: 'ERROR', message: errorData.message || `API request failed with status ${response.status}`, data: null } as unknown as T;

    }
    if (response.status === 204) { 
        return { type: 'OK', message: 'Operation successful (No Content)' } as unknown as T;
    }
    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`API call failed for endpoint ${endpoint}:`, error);
    return { type: 'ERROR', message: (error as Error).message || 'An unexpected error occurred', data:null } as unknown as T;
  }
}

// Auth API functions
export const loginUser = async (credentials: LoginPayload): Promise<ApiResponse<{ user: User; token: string }>> => {
  return fetchApi<ApiResponse<{ user: User; token: string }>>('auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};


// Product API functions
export const getProducts = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Product, 'products'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<Product, 'products'>>(`products?${queryParams.toString()}`);
};
export const getProductById = async (id: string): Promise<ApiResponse<{product: Product}>> => {
  return fetchApi<ApiResponse<{product: Product}>>(`products?id=${id}`);
};

export const createProduct = async (productDataOrFormData: Product | FormData): Promise<ApiResponse<Product>> => {
  if (productDataOrFormData instanceof FormData) {
    return fetchApi<ApiResponse<Product>>('products', {
      method: 'POST',
      body: productDataOrFormData,
    }, true); 
  } else {
     return fetchApi<ApiResponse<Product>>('products', {
      method: 'POST',
      body: JSON.stringify(productDataOrFormData),
    });
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
  return fetchApi<ApiResponse<Product>>(`products?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};
export const deleteProduct = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`products?id=${id}`, {
    method: 'DELETE',
  });
};

// File Upload function (generic)
export const uploadFiles = async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file)); 
  return fetchApi<ApiResponse<{ urls: string[] }>>('upload/images', { 
    method: 'POST',
    body: formData,
  }, true);
};


// Category API functions
export const getCategories = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Category, 'categories'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<Category, 'categories'>>(`categories?${queryParams.toString()}`);
};
export const getCategoryById = async (id: string): Promise<ApiResponse<{categories:Category[]}>> => {
  return fetchApi<ApiResponse<{categories:Category[]}>>(`categories?id=${id}`);
};
export const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> | FormData): Promise<ApiResponse<Category>> => {
  let body: BodyInit;
  let isFormData = false;
  if (categoryData instanceof FormData) {
    body = categoryData;
    isFormData = true;
  } else {
    body = JSON.stringify(categoryData);
  }
  return fetchApi<ApiResponse<Category>>('categories', {
    method: 'POST',
    body: body,
  }, isFormData);
};
export const updateCategory = async (id: string, categoryData: Partial<Category> | FormData): Promise<ApiResponse<Category>> => {
  let body: BodyInit;
  let isFormData = false;
  if (categoryData instanceof FormData) {
    body = categoryData;
    isFormData = true;
  } else {
    body = JSON.stringify(categoryData);
  }
  return fetchApi<ApiResponse<Category>>(`categories?id=${id}`, {
    method: 'PUT',
    body: body,
  }, isFormData);
};
export const deleteCategory = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`categories?id=${id}`, {
    method: 'DELETE',
  });
};


// Brand API functions
export const getBrands = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Brand, 'brands'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
  return fetchApi<PaginatedResponse<Brand, 'brands'>>(`brands?${queryParams.toString()}`);
};
export const getBrandById = async (id: string): Promise<ApiResponse<{brand: Brand}>> => {
  return fetchApi<ApiResponse<{brand: Brand}>>(`brands/${id}`);
};
export const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Brand>> => {
  return fetchApi<ApiResponse<Brand>>('brands', {
    method: 'POST',
    body: JSON.stringify(brandData),
  });
};
export const updateBrand = async (id: string, brandData: Partial<Brand>): Promise<ApiResponse<Brand>> => {
  return fetchApi<ApiResponse<Brand>>(`brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(brandData),
  });
};
export const deleteBrand = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`brands/${id}`, {
    method: 'DELETE',
  });
};

// Inventory API functions (for Product Stock based on OpenAPI)
export const getInventoryItems = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<Inventory, 'inventory'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  const response = await fetchApi<any>(`inventory?${queryParams.toString()}`);
  
  // Transform the response to match expected format
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        inventory: response.data.items || []
      },
      pagination: response.meta
    };
  }
  
  return response as PaginatedResponse<Inventory, 'inventory'>;
};
export const getInventoryItemById = async (id: string): Promise<ApiResponse<{inventory: Inventory}>> => {
  return fetchApi<ApiResponse<{inventory: Inventory}>>(`inventory/${id}`);
};
export const createInventoryItem = async (inventoryData: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>): Promise<ApiResponse<Inventory>> => {
  return fetchApi<ApiResponse<Inventory>>('inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  });
};
export const updateInventoryItem = async (id: string, inventoryData: Partial<Inventory>): Promise<ApiResponse<Inventory>> => {
  return fetchApi<ApiResponse<Inventory>>(`inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  });
};
export const deleteInventoryItem = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`inventory/${id}`, {
    method: 'DELETE',
  });
};

// FAQ API functions
export const getFaqs = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<FAQ, 'faqs'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  return fetchApi<PaginatedResponse<FAQ, 'faqs'>>(`faqs?${queryParams.toString()}`);
};
export const getFaqById = async (id: string): Promise<ApiResponse<{faq: FAQ}>> => {
  return fetchApi<ApiResponse<{faq: FAQ}>>(`faqs?id=${id}`);
};
export const createFaq = async (faqData: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FAQ>> => {
  return fetchApi<ApiResponse<FAQ>>('faqs', {
    method: 'POST',
    body: JSON.stringify(faqData),
  });
};
export const updateFaq = async (id: string, faqData: Partial<FAQ>): Promise<ApiResponse<FAQ>> => {
  return fetchApi<ApiResponse<FAQ>>(`faqs?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(faqData),
  });
};
export const deleteFaq = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`faqs?id=${id}`, {
    method: 'DELETE',
  });
};


// --- MOCKED APIs for features not in OpenAPI spec ---

// Soft Inventory API functions (Mocked - not in OpenAPI)
export const getSoftInventoryItems = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<SoftInventoryItem, 'softInventoryItems'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  const response = await fetchApi<any>(`soft-inventory?${queryParams.toString()}`);
  
  // Transform the response to match expected format
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        softInventoryItems: response.data.softInventoryItems || []
      },
      pagination: response.meta
    };
  }
  
  return response as PaginatedResponse<SoftInventoryItem, 'softInventoryItems'>;
};
export const addSoftInventoryItem = async (itemData: Omit<SoftInventoryItem, 'id' | 'lastUpdated' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SoftInventoryItem>> => {
  return fetchApi<ApiResponse<SoftInventoryItem>>('soft-inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

// Brand Daily Orders API functions (Mocked - not in OpenAPI)
export const getBrandDailyOrders = async (brandId: string, date: string): Promise<ApiResponse<{ orders: BrandDailyOrderItem[] }>> => {
  await delay(300);
  console.log(`Mock API: Fetching daily orders for brand ${brandId} on ${date}`);
  const mockOrders: BrandDailyOrderItem[] = [
    { id: `order-${Date.now()}-1`, sku: 'SKU123', color: 'Red', size: 'M', quantity: 2 },
    { id: `order-${Date.now()}-2`, sku: 'SKU456', color: 'Blue', size: 'L', quantity: 1 },
    { id: `order-${Date.now()}-3`, sku: 'SKU789', size: 'S', quantity: 5 },
  ];
  return { type: 'OK', data: { orders: mockOrders } };
};

export const submitBrandOrdersToPlaced = async (brandId: string, orderIds: string[]): Promise<ApiResponse<{ batch: OrderPlacedBatch }>> => {
  await delay(300);
  console.log(`Mock API: Submitting orders ${orderIds.join(', ')} for brand ${brandId} to Order Placed.`);
  const mockBatch: OrderPlacedBatch = {
    id: `batch-${Date.now()}`,
    brandId,
    submissionDate: new Date().toISOString().split('T')[0],
    items: orderIds.map(id => ({
      originalOrderId: id,
      id: `item-in-batch-${id}`,
      sku: `SKU_FOR_${id.slice(0,6)}`,
      size: 'M',
      quantity: Math.floor(Math.random() * 3) + 1,
    })),
    deliveryStatus: 'Pending',
    createdAt: new Date().toISOString(),
  };
  return { type: 'OK', data: { batch: mockBatch }, message: 'Orders submitted to Order Placed (mocked).' };
};

// Order Placed Batches API functions (Mocked - not in OpenAPI)
export const getOrderPlacedBatches = async (brandId: string, date?: string): Promise<ApiResponse<{ batches: OrderPlacedBatch[] }>> => {
  await delay(300);
  console.log(`Mock API: Fetching order placed batches for brand ${brandId}` + (date ? ` on ${date}` : ''));
  const mockBatches: OrderPlacedBatch[] = [
    { id: `batch-1`, brandId, submissionDate: '2023-10-25', items: [], trackingId: 'TRK123', deliveryStatus: 'Delivered', createdAt: new Date().toISOString() },
    { id: `batch-2`, brandId, submissionDate: '2023-10-26', items: [], deliveryStatus: 'Pending', createdAt: new Date().toISOString() },
  ];
  return { type: 'OK', data: { batches: mockBatches } };
};

export const updateOrderPlacedBatch = async (batchId: string, updateData: Partial<Pick<OrderPlacedBatch, 'trackingId' | 'deliveryStatus'>>): Promise<ApiResponse<OrderPlacedBatch>> => {
  await delay(300);
  console.log(`Mock API: Updating order placed batch ${batchId} with`, updateData);
  const mockUpdatedBatch: OrderPlacedBatch = {
    id: batchId,
    brandId: 'brand-mock-id',
    submissionDate: new Date().toISOString().split('T')[0],
    items: [],
    ...updateData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { type: 'OK', data: mockUpdatedBatch, message: 'Order placed batch updated (mocked).' };
};


// --- END MOCKED APIs ---


// User API functions
export const getUsers = async (page = 1, limit = 10, filters: Record<string,any> = {}): Promise<PaginatedResponse<User, 'users'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  const response = await fetchApi<any>(`users?${queryParams.toString()}`);
  
  // Transform the response to match expected format
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        users: response.data.users || []
      },
      pagination: response.meta
    };
  }
  
  return response as PaginatedResponse<User, 'users'>;
};

export const getUsersByRole = async (role: string, page = 1, limit = 10): Promise<PaginatedResponse<User, 'users'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetchApi<any>(`users/role/${role}?${queryParams.toString()}`);
  
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        users: response.data.users || []
      },
      pagination: response.data.pagination
    };
  }
  
  return response as PaginatedResponse<User, 'users'>;
};

export const getUserStats = async (): Promise<ApiResponse<{ stats: any[]; total: number; active: number }>> => {
  return fetchApi<ApiResponse<{ stats: any[]; total: number; active: number }>>('users/stats');
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  const { password, ...dataToUpdate } = userData;
  return fetchApi<ApiResponse<User>>(`users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dataToUpdate),
  });
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
  return fetchApi<ApiResponse<User>>('users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`users?id=${id}`, {
    method: 'DELETE',
  });
};

export const toggleUserStatus = async (id: string): Promise<ApiResponse<User>> => {
  return fetchApi<ApiResponse<User>>(`users/${id}/toggle-status`, {
    method: 'PATCH',
  });
};

export const getCurrentUserInfo = async (): Promise<ApiResponse<{ user: User; availableRoutes: string[]; permissions: any }>> => {
  return fetchApi<ApiResponse<{ user: User; availableRoutes: string[]; permissions: any }>>('auth/me');
};


// Order API functions
export const getOrders = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<Order, 'orders'>> => {
  await delay(300);
  return { type: 'OK', data: { orders: MOCK_ORDERS }, pagination: {total: MOCK_ORDERS.length, page, limit, totalPages: Math.ceil(MOCK_ORDERS.length/limit), hasNextPage: (page * limit < MOCK_ORDERS.length) , hasPrevPage: page > 1} };
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
};

export const deleteOrder = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`orders/${id}`, {
    method: 'DELETE',
  });
};

// Customer API functions - Mocked, OpenAPI has no /customers endpoint
export const getCustomers = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<Customer, 'customers'>> => {
  await delay(300);
  return { type: 'OK', data: { customers: MOCK_CUSTOMERS }, pagination: {total: MOCK_CUSTOMERS.length, page, limit, totalPages: Math.ceil(MOCK_CUSTOMERS.length/limit), hasNextPage: (page * limit < MOCK_CUSTOMERS.length) , hasPrevPage: page > 1} };
};

// DiscountCode API functions - Mocked, OpenAPI has no /discount-codes endpoint
export const getDiscountCodes = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<DiscountCode, 'discountCodes'>> => {
  await delay(300);
  return { type: 'OK', data: { discountCodes: MOCK_DISCOUNTS }, pagination: {total: MOCK_DISCOUNTS.length, page, limit, totalPages: Math.ceil(MOCK_DISCOUNTS.length/limit), hasNextPage: (page * limit < MOCK_DISCOUNTS.length) , hasPrevPage: page > 1} };
};

// BlogPost API functions - Mocked, OpenAPI has no /blog-posts endpoint
export const getBlogPosts = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<BlogPost, 'blogPosts'>> => {
  await delay(300);
  const { MOCK_USERS } = await import('@/lib/mockData'); 
  const enrichedPosts = MOCK_BLOG_POSTS.map(post => {
    const author = MOCK_USERS.find(u => u.id === post.author);
    return { ...post, authorName: author?.name || 'Unknown' };
  });
  return { type: 'OK', data: { blogPosts: enrichedPosts }, pagination: {total: MOCK_BLOG_POSTS.length, page, limit, totalPages: Math.ceil(MOCK_BLOG_POSTS.length/limit), hasNextPage: (page * limit < MOCK_BLOG_POSTS.length) , hasPrevPage: page > 1} };
};

// ActivityLog API functions
export const getActivityLogs = async (page = 1, limit = 10, filters = {}): Promise<PaginatedResponse<ActivityLog, 'activityLogs'>> => {
  await delay(300);
  const { MOCK_USERS: usersForLogs } = await import('@/lib/mockData'); 
  const enrichedLogs = MOCK_ACTIVITY_LOGS.map(log => {
    const user = usersForLogs.find(u => u.id === log.userId);
    return { ...log, user };
  });
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLogs = enrichedLogs.slice(startIndex, endIndex);

  return { type: 'OK', data: { activityLogs: paginatedLogs }, pagination: {total: MOCK_ACTIVITY_LOGS.length, page, limit, totalPages: Math.ceil(MOCK_ACTIVITY_LOGS.length/limit), hasNextPage: (page * limit < MOCK_ACTIVITY_LOGS.length) , hasPrevPage: page > 1} };
};


export const getAppSettings = async (): Promise<ApiResponse<AppSettings>> => {
  const response = await fetchApi<ApiResponse<{ settings: AppSettings }>>('app-settings');
  if (response.type === 'ERROR') {
    console.error('Failed to fetch app settings:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  const data = response.data?.settings || undefined;
  return { type: 'OK', data, message: 'App settings fetched successfully' };
};

export const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<ApiResponse<AppSettings>> => {
  console.log("Log: Updating app settings with data:", settingsData);
  const response = await fetchApi<ApiResponse<{ settings: AppSettings }>>('app-settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
  if (response.type === 'ERROR') {
    console.error('Failed to update app settings:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', data: response.data?.settings, message: 'App settings updated successfully' };
};

export const generateApiKey = async (): Promise<ApiResponse<{ apiKey: string }>> => {
  const response = await fetchApi<ApiResponse<{ apiKey: string }>>('app-settings/generate-api-key', {
    method: 'POST',
  });
  if (response.type === 'ERROR') {
    console.error('Failed to generate API key:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', data: response.data, message: 'API key generated successfully' };
};

// File upload functions for app settings
export const uploadStoreLogo = async (file: File): Promise<ApiResponse<{ storeLogo: any }>> => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await fetchApi<ApiResponse<{ storeLogo: any }>>('app-settings/upload/logo', {
    method: 'POST',
    body: formData,
  }, true);
  
  if (response.type === 'ERROR') {
    console.error('Failed to upload store logo:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', data: response.data, message: 'Store logo uploaded successfully' };
};

export const uploadHeroImage = async (file: File): Promise<ApiResponse<{ heroImage: any }>> => {
  const formData = new FormData();
  formData.append('hero', file);
  
  const response = await fetchApi<ApiResponse<{ heroImage: any }>>('app-settings/upload/hero', {
    method: 'POST',
    body: formData,
  }, true);
  
  if (response.type === 'ERROR') {
    console.error('Failed to upload hero image:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', data: response.data, message: 'Hero image uploaded successfully' };
};

export const deleteStoreLogo = async (): Promise<ApiResponse> => {
  const response = await fetchApi<ApiResponse>('app-settings/logo', {
    method: 'DELETE',
  });
  if (response.type === 'ERROR') {
    console.error('Failed to delete store logo:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', message: 'Store logo deleted successfully' };
};

export const deleteHeroImage = async (): Promise<ApiResponse> => {
  const response = await fetchApi<ApiResponse>('app-settings/hero', {
    method: 'DELETE',
  });
  if (response.type === 'ERROR') {
    console.error('Failed to delete hero image:', response.message);
    return { type: 'ERROR', message: response.message, data: null };
  }
  return { type: 'OK', message: 'Hero image deleted successfully' };
};

// --- DASHBOARD STATS ---
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStatsData>> => {
    // This function would ideally hit a real backend endpoint like /api/dashboard/stats
    // For now, we'll mock the response structure.
    await delay(500); 
    // const mockData: DashboardStatsData = {
    //   todayStats: {
    //     orders: Math.floor(Math.random() * 50),
    //     revenue: Math.floor(Math.random() * 5000) + 500,
    //   },
    //   overallStats: {
    //     totalOrders: Math.floor(Math.random() * 10000) + 1000,
    //     totalRevenue: Math.floor(Math.random() * 200000) + 50000,
    //     totalCustomers: Math.floor(Math.random() * 2000) + 500,
    //   },
    //   salesOverview: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
    //     date: month, // In real API, this would be a proper date string
    //     revenue: Math.floor(Math.random() * 15000) + 5000,
    //     orders: Math.floor(Math.random() * 100) + 20,
    //   })),
    //   topSellingProducts: [
    //     { productId: 'prod-1', productName: 'Smartphone X', totalQuantity: Math.floor(Math.random()*100), totalRevenue: Math.floor(Math.random()*10000) },
    //     { productId: 'prod-2', productName: 'Laptop Pro', totalQuantity: Math.floor(Math.random()*80), totalRevenue: Math.floor(Math.random()*15000) },
    //     { productId: 'prod-4', productName: 'Wireless Headphones', totalQuantity: Math.floor(Math.random()*150), totalRevenue: Math.floor(Math.random()*7000) },
    //   ],
    // };
    // return { type: 'OK', data: mockData, message: "Dashboard stats fetched (mocked)." };
    return fetchApi<ApiResponse<DashboardStatsData>>('dashboard/stats');
};

// --- SOFT INVENTORY API FUNCTIONS ---
export const getSoftInventoryItemById = async (id: string): Promise<ApiResponse<{ softInventoryItem: SoftInventoryItem }>> => {
  return fetchApi<ApiResponse<{ softInventoryItem: SoftInventoryItem }>>(`soft-inventory/${id}`);
};

export const updateSoftInventoryItem = async (id: string, itemData: Partial<SoftInventoryItem>): Promise<ApiResponse<SoftInventoryItem>> => {
  return fetchApi<ApiResponse<SoftInventoryItem>>(`soft-inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

export const deleteSoftInventoryItem = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`soft-inventory?id=${id}`, {
    method: 'DELETE',
  });
};

export const getLowStockItems = async (threshold = 10): Promise<ApiResponse<{ lowStockItems: SoftInventoryItem[] }>> => {
  return fetchApi<ApiResponse<{ lowStockItems: SoftInventoryItem[] }>>(`soft-inventory/low-stock?threshold=${threshold}`);
};

export const getOutOfStockItems = async (): Promise<ApiResponse<{ outOfStockItems: SoftInventoryItem[] }>> => {
  return fetchApi<ApiResponse<{ outOfStockItems: SoftInventoryItem[] }>>('soft-inventory/out-of-stock');
};

export const bulkUpdateSoftInventoryQuantities = async (updates: { id: string; quantity: number }[]): Promise<ApiResponse<{ updatedItems: SoftInventoryItem[]; errors: any[] }>> => {
  return fetchApi<ApiResponse<{ updatedItems: SoftInventoryItem[]; errors: any[] }>>('soft-inventory/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ updates }),
  });
};

// --- HARD INVENTORY API FUNCTIONS ---
export const getHardInventoryItems = async (page = 1, limit = 10, filters: Record<string, any> = {}): Promise<PaginatedResponse<HardInventoryItem, 'hardInventoryItems'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit), ...filters });
  const response = await fetchApi<any>(`hard-inventory?${queryParams.toString()}`);
  
  // Transform the response to match expected format
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        hardInventoryItems: response.data.hardInventoryItems || []
      },
      pagination: response.meta
    };
  }
  
  return response as PaginatedResponse<HardInventoryItem, 'hardInventoryItems'>;
};

export const getHardInventoryItemById = async (id: string): Promise<ApiResponse<{ hardInventoryItem: HardInventoryItem }>> => {
  return fetchApi<ApiResponse<{ hardInventoryItem: HardInventoryItem }>>(`hard-inventory/${id}`);
};

export const createHardInventoryItem = async (itemData: Omit<HardInventoryItem, 'id' | 'lastUpdated' | 'lastSyncAt' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<HardInventoryItem>> => {
  return fetchApi<ApiResponse<HardInventoryItem>>('hard-inventory', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
};

export const updateHardInventoryItem = async (id: string, itemData: Partial<HardInventoryItem>): Promise<ApiResponse<HardInventoryItem>> => {
  return fetchApi<ApiResponse<HardInventoryItem>>(`hard-inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
};

export const deleteHardInventoryItem = async (id: string): Promise<ApiResponse> => {
  return fetchApi<ApiResponse>(`hard-inventory?id=${id}`, {
    method: 'DELETE',
  });
};

export const getHardInventoryByPlatform = async (platform: string, page = 1, limit = 10): Promise<PaginatedResponse<HardInventoryItem, 'hardInventoryItems'>> => {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await fetchApi<any>(`hard-inventory/platform/${platform}?${queryParams.toString()}`);
  
  // Transform the response to match expected format
  if (response.type === 'OK' && response.data) {
    return {
      ...response,
      data: {
        hardInventoryItems: response.data.hardInventoryItems || []
      },
      pagination: response.meta
    };
  }
  
  return response as PaginatedResponse<HardInventoryItem, 'hardInventoryItems'>;
};

export const getLowStockByPlatform = async (platform: string, threshold = 10): Promise<ApiResponse<{ lowStockItems: HardInventoryItem[] }>> => {
  return fetchApi<ApiResponse<{ lowStockItems: HardInventoryItem[] }>>(`hard-inventory/platform/${platform}/low-stock?threshold=${threshold}`);
};

export const getOutOfStockByPlatform = async (platform: string): Promise<ApiResponse<{ outOfStockItems: HardInventoryItem[] }>> => {
  return fetchApi<ApiResponse<{ outOfStockItems: HardInventoryItem[] }>>(`hard-inventory/platform/${platform}/out-of-stock`);
};

export const bulkUpdateHardInventoryQuantities = async (updates: { id: string; quantity: number }[]): Promise<ApiResponse<{ updatedItems: HardInventoryItem[]; errors: any[] }>> => {
  return fetchApi<ApiResponse<{ updatedItems: HardInventoryItem[]; errors: any[] }>>('hard-inventory/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ updates }),
  });
};

export const syncPlatformData = async (platform: string, items: any[]): Promise<ApiResponse<{ syncedItems: HardInventoryItem[]; errors: any[] }>> => {
  return fetchApi<ApiResponse<{ syncedItems: HardInventoryItem[]; errors: any[] }>>(`hard-inventory/platform/${platform}/sync`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
};

// Cleanup API functions
export const getCleanupStatus = async (): Promise<ApiResponse<{
  isRunning: boolean;
  schedulerActive: boolean;
  lastRun: string | null;
  nextScheduledRun: string;
  uploadsDirectory: string;
}>> => {
  return fetchApi<ApiResponse<{
    isRunning: boolean;
    schedulerActive: boolean;
    lastRun: string | null;
    nextScheduledRun: string;
    uploadsDirectory: string;
  }>>('cleanup/status');
};

export const getOrphanedFilesPreview = async (): Promise<ApiResponse<{
  totalFilesInUploads: number;
  referencedFiles: number;
  orphanedFiles: number;
  orphanedFileList: string[];
  estimatedSpaceSaved: string;
  timestamp: string;
}>> => {
  return fetchApi<ApiResponse<{
    totalFilesInUploads: number;
    referencedFiles: number;
    orphanedFiles: number;
    orphanedFileList: string[];
    estimatedSpaceSaved: string;
    timestamp: string;
  }>>('cleanup/preview');
};

export const triggerManualCleanup = async (): Promise<ApiResponse<{
  message: string;
  timestamp: string;
}>> => {
  return fetchApi<ApiResponse<{
    message: string;
    timestamp: string;
  }>>('cleanup/trigger', {
    method: 'POST',
  });
};

export const startCleanupScheduler = async (): Promise<ApiResponse<{
  message: string;
  nextRun: string;
  timestamp: string;
}>> => {
  return fetchApi<ApiResponse<{
    message: string;
    nextRun: string;
    timestamp: string;
  }>>('cleanup/scheduler/start', {
    method: 'POST',
  });
};

export const stopCleanupScheduler = async (): Promise<ApiResponse<{
  message: string;
  timestamp: string;
}>> => {
  return fetchApi<ApiResponse<{
    message: string;
    timestamp: string;
  }>>('cleanup/scheduler/stop', {
    method: 'POST',
  });
};

// Return/Exchange API functions
export const fetchOrderReturns = async (orderId: string) => {
  const response = await fetchApi<ApiResponse<{ returns: any[] }>>(`orders/${orderId}/returns`);
  if (response.type === 'ERROR') throw new Error(response.message || 'Failed to fetch returns');
  return response.data?.returns || [];
};

export const updateOrderReturnRequest = async (orderId: string, returnId: string, data: { status?: string; adminNotes?: string }) => {
  const response = await fetchApi<ApiResponse<{ return: any }>>(`orders/${orderId}/returns/${returnId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (response.type === 'ERROR') throw new Error(response.message || 'Failed to update return request');
  return response.data?.return;
};
