# Role-Based Rides Page

## Overview

This implementation provides a unified rides page that displays different views based on the user's role (admin, driver, or customer). The page automatically detects the user's role and renders the appropriate component.

## Files Created

### 1. Server Actions: `/lib/actions/ridesViewActions.ts`

Server-side functions for fetching role-specific ride data:

- **`fetchDriverCompletedRides()`**: Returns all completed rides where the user is the assigned driver
- **`fetchDriverAssignedRides()`**: Returns all pending/assigned rides where the user is the assigned driver
- **`fetchPendingRides()`**: Returns all pending rides without an assigned driver (available for drivers to request)
- **`fetchCustomerCompletedRides()`**: Returns all completed rides where the user is a customer
- **`fetchCustomerRequestedRides()`**: Returns all pending/assigned rides where the user is a customer

All functions include:
- Role-based authorization checks
- Proper error handling with ActionResponse type
- Full ride data with relations (driver, customers)
- Null safety for waitingTime and options fields

### 2. Driver View: `/components/driver/DriverRidesView.tsx`

A tabbed interface for drivers with 3 views:

1. **My Assigned Rides**: Shows rides currently assigned to the driver (pending/assigned status)
2. **Available Rides**: Shows unassigned pending rides that can be requested
3. **Completed Rides**: Shows the driver's ride history

Features:
- Tab navigation with badge counts
- Loading states with spinners
- Error handling with retry functionality
- Summary statistics cards
- Table display with:
  - Ride ID
  - Route (departure → destination)
  - Departure time
  - Customer list
  - Price
  - Status badge

### 3. Customer View: `/components/customer/CustomerRidesView.tsx`

A tabbed interface for customers with 2 views:

1. **Pending Rides**: Shows rides requested but not yet completed
2. **Completed Rides**: Shows the customer's ride history

Features:
- Tab navigation with badge counts
- Loading states with spinners
- Error handling with retry functionality
- Summary statistics cards
- Table display with:
  - Ride ID
  - Route (departure → destination)
  - Departure time
  - Assigned driver
  - Price
  - Status badge

### 4. Unified Page: `/app/rides/page.tsx`

The main page that handles routing based on user role:

- **Admin**: Renders `RidesManagementBoard` (full CRUD operations)
- **Driver**: Renders `DriverRidesView` (3 tabbed views)
- **Customer**: Renders `CustomerRidesView` (2 tabbed views)
- **Unauthenticated**: Redirects to login
- **Unknown Role**: Shows access denied message

## Usage

### Accessing the Page

Navigate to `/rides` in your application. The page will automatically:
1. Check if the user is authenticated
2. Detect the user's role
3. Render the appropriate view

### Admin View

Admins see the existing `RidesManagementBoard` with full CRUD capabilities:
- View all rides in the system
- Create new rides
- Edit existing rides
- Assign/reassign drivers
- Cancel/delete rides
- Export to CSV
- Advanced filtering and sorting

### Driver View

Drivers see 3 tabs:
1. **My Assigned Rides**: Rides they need to complete
2. **Available Rides**: Rides they can request to be assigned to
3. **Completed Rides**: Their ride history

### Customer View

Customers see 2 tabs:
1. **Pending Rides**: Track requested rides still in progress
2. **Completed Rides**: View ride history

## Styling

All components use:
- Tailwind CSS for styling
- lucide-react icons
- Consistent color scheme:
  - Blue for primary actions and assigned rides
  - Yellow for pending/available rides
  - Green for completed rides
  - Red for cancelled rides
- Responsive design with mobile support

## Security

- All server actions check user authentication
- Role-based authorization prevents unauthorized access
- Users can only see rides relevant to their role
- Drivers can only see their own rides or available rides
- Customers can only see rides where they are a customer

## Error Handling

- All server actions return `ActionResponse<T>` for consistent error handling
- UI components display user-friendly error messages
- Retry functionality for failed data fetches
- Loading states to prevent interaction during data fetching

## Future Enhancements

Potential improvements:
- Add pagination for large datasets
- Implement real-time updates with websockets
- Add driver assignment request functionality in the Available Rides view
- Add ride cancellation for customers
- Implement ride filtering and search within each view
- Add ride details modal/drawer
- Export functionality for drivers and customers
- Notifications for new available rides (drivers) or status changes (customers)

## Related Files

- `/lib/db/schema.ts`: Database schema definitions
- `/content/database_types/ride.ts`: TypeScript type definitions
- `/components/admin/rideManagement/RidesManagementBoard.tsx`: Admin ride management
- `/lib/types/action-response.ts`: ActionResponse type definition
- `/lib/auth/auth.ts`: Authentication configuration
