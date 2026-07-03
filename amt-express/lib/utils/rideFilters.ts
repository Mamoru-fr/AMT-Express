/**
 * Ride Filters Utilities
 * 
 * Centralizes filter logic for rides management.
 * Used both in Server Components (for server-side filtering) and Client Components (for UI state).
 */

import { type RideStatus } from '@/content/database_types/ride';

// Local type that matches what ColumnFilter component uses
export interface ColumnFilter {
  column: string;
  value: string | string[];
  operator?: 'equals' | 'contains' | 'in' | 'gt' | 'lt';
}

// ============================================
// Types
// ============================================

export interface RideServerFilters {
  search?: string;
  status?: RideStatus | 'all' | RideStatus[];
  sortBy?: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  columnFilters?: ColumnFilter[];
}

export interface RideFilterOption {
  value: string;
  label: string;
}

// ============================================
// Filter Options
// ============================================

/**
 * Status filter options for the dropdown
 */
export const statusFilterOptions: RideFilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Sort column options
 */
export const sortColumnOptions: RideFilterOption[] = [
  { value: 'departureTime', label: 'Departure Time' },
  { value: 'departure', label: 'Departure' },
  { value: 'destination', label: 'Destination' },
  { value: 'clients', label: 'Clients' },
  { value: 'driver', label: 'Driver' },
  { value: 'price', label: 'Price' },
  { value: 'status', label: 'Status' },
];

/**
 * Sort order options
 */
export const sortOrderOptions: RideFilterOption[] = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

// ============================================
// Filter Building Functions
// ============================================

/**
 * Builds a Drizzle WHERE clause from column filters
 * This can be used in server components for server-side filtering
 */
export function buildColumnFiltersWhereClause(columnFilters: ColumnFilter[] = []) {
  // @ts-ignore - We're building a dynamic where clause
  return (rides: any, { eq, ilike, or, and, gt, lt, in: opIn }: any) => {
    const conditions: any[] = [];
    
    for (const filter of columnFilters) {
      if (!filter.value || filter.value.length === 0) continue;
      
      const column = filter.column;
      const operator = filter.operator;
      const value = filter.value;
      
      switch (column) {
        case 'id':
          conditions.push(eq(rides.id, Number(Array.isArray(value) ? value[0] : value)));
          break;
          
        case 'status':
          if (Array.isArray(value)) {
            conditions.push(opIn(rides.status, value));
          } else {
            conditions.push(eq(rides.status, value));
          }
          break;
          
        case 'departure':
          conditions.push(ilike(rides.departure, `%${Array.isArray(value) ? value.join(' ') : value}%`));
          break;
          
        case 'destination':
          conditions.push(ilike(rides.destination, `%${Array.isArray(value) ? value.join(' ') : value}%`));
          break;
          
        case 'price':
          const priceValue = Array.isArray(value) ? value[0] : value;
          const priceNum = parseFloat(priceValue);
          if (operator === 'gt') {
            conditions.push(gt(rides.price, priceValue));
          } else if (operator === 'lt') {
            conditions.push(lt(rides.price, priceValue));
          } else {
            conditions.push(eq(rides.price, priceValue));
          }
          break;
          
        case 'departureTime':
          // For date filtering, we'd need to parse the date
          // This is a simplified version
          conditions.push(ilike(rides.departureTime, `%${Array.isArray(value) ? value.join(' ') : value}%`));
          break;
          
        // For client/driver filters, we need joins which makes it more complex
        // These are better handled client-side or with more complex server logic
        case 'clients':
        case 'driver':
          // Skip server-side filtering for these, handle client-side
          break;
      }
    }
    
    return conditions.length > 0 ? and(...conditions) : undefined;
  };
}

/**
 * Converts column filters to server filters
 * Server filters can be passed to API endpoints
 */
export function convertToServerFilters(columnFilters: ColumnFilter[] = []): Partial<RideServerFilters> {
  const serverFilters: Partial<RideServerFilters> = {};
  
  for (const filter of columnFilters) {
    if (!filter.value || filter.value.length === 0) continue;
    
    switch (filter.column) {
      case 'status':
        if (Array.isArray(filter.value)) {
          serverFilters.status = filter.value as RideStatus[];
        } else {
          serverFilters.status = filter.value as RideStatus;
        }
        break;
        
      case 'departure':
      case 'destination':
        serverFilters.search = Array.isArray(filter.value) ? filter.value.join(' ') : filter.value;
        break;
        
      case 'sortBy':
        serverFilters.sortBy = filter.value as any;
        break;
        
      case 'sortOrder':
        serverFilters.sortOrder = filter.value as 'asc' | 'desc';
        break;
    }
  }
  
  return serverFilters;
}

// ============================================
// Filter Validation
// ============================================

export interface FilterValidationResult {
  valid: boolean;
  errors: string[];
  validated: Required<RideServerFilters>;
}

/**
 * Validates ride filters
 */
export function validateRideFilters(filters: Partial<RideServerFilters>): FilterValidationResult {
  const errors: string[] = [];
  const validated = { ...DEFAULT_RIDE_FILTERS, ...filters };
  
  // Validate page
  if (validated.page < 1) {
    errors.push('Page must be at least 1');
    validated.page = 1;
  }
  
  // Validate limit
  if (validated.limit < 1 || validated.limit > 1000) {
    errors.push('Limit must be between 1 and 1000');
    validated.limit = Math.min(Math.max(validated.limit, 1), 1000);
  }
  
  // Validate sortBy
  const validSortColumns: string[] = ['departureTime', 'clients', 'departure', 'destination', 'driver', 'price', 'status'];
  if (validated.sortBy && !validSortColumns.includes(validated.sortBy)) {
    errors.push(`Invalid sortBy: ${validated.sortBy}`);
    validated.sortBy = 'departureTime';
  }
  
  // Validate sortOrder
  if (validated.sortOrder && !['asc', 'desc'].includes(validated.sortOrder)) {
    errors.push('sortOrder must be either "asc" or "desc"');
    validated.sortOrder = 'desc';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    validated: validated as Required<RideServerFilters>,
  };
}

// ============================================
// Filter URL Serialization
// ============================================

/**
 * Converts filters to URL search params
 * Useful for sharing filtered views via URL
 */
export function filtersToSearchParams(filters: Partial<RideServerFilters>): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.status && filters.status !== 'all') {
    params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
  }
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  
  return params;
}

/**
 * Parses URL search params to filters
 */
export function searchParamsToFilters(searchParams: URLSearchParams): Partial<RideServerFilters> {
  const filters: Partial<RideServerFilters> = {};
  
  if (searchParams.has('search')) {
    filters.search = searchParams.get('search') || '';
  }
  
  if (searchParams.has('status')) {
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.includes(',') ? status.split(',') as RideStatus[] : status as RideStatus;
    }
  }
  
  if (searchParams.has('sortBy')) {
    filters.sortBy = searchParams.get('sortBy') as any;
  }
  
  if (searchParams.has('sortOrder')) {
    filters.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
  }
  
  if (searchParams.has('page')) {
    const page = parseInt(searchParams.get('page') || '1');
    if (!isNaN(page)) filters.page = page;
  }
  
  if (searchParams.has('limit')) {
    const limit = parseInt(searchParams.get('limit') || '50');
    if (!isNaN(limit)) filters.limit = limit;
  }
  
  return filters;
}

// ============================================
// Default Filter Values
// ============================================

/**
 * Default filter values
 */
export const DEFAULT_RIDE_FILTERS: Required<RideServerFilters> = {
  search: '',
  status: 'all',
  sortBy: 'departureTime',
  sortOrder: 'desc',
  page: 1,
  limit: 50,
  columnFilters: [],
};

export default {
  DEFAULT_RIDE_FILTERS,
  statusFilterOptions,
  sortColumnOptions,
  sortOrderOptions,
  buildColumnFiltersWhereClause,
  convertToServerFilters,
  validateRideFilters,
  filtersToSearchParams,
  searchParamsToFilters,
};
