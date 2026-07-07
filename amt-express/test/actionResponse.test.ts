import { describe, it, expect } from 'vitest';
import { ActionResponse, ErrorCodes } from '../lib/types/action-response';

describe('ActionResponse Type [UNIT]', () => {
    describe('Success Response', () => {
        it('should create a valid success response with data', () => {
            const response: ActionResponse<string> & { error?: undefined; code?: undefined; details?: undefined } = {
                success: true,
                data: 'test data'
            };

            expect(response.success).toBe(true);
            expect(response.data).toBe('test data');
            expect(response.error).toBeUndefined();
            expect(response.code).toBeUndefined();
            expect(response.details).toBeUndefined();
        });

        it('should create a valid success response with object data', () => {
            const response: ActionResponse<{ id: string; name: string }> = {
                success: true,
                data: { id: '123', name: 'Test' }
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual({ id: '123', name: 'Test' });
        });

        it('should create a valid success response with array data', () => {
            const response: ActionResponse<string[]> = {
                success: true,
                data: ['item1', 'item2', 'item3']
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual(['item1', 'item2', 'item3']);
        });

        it('should create a valid success response with null data', () => {
            const response: ActionResponse<null> = {
                success: true,
                data: null
            };

            expect(response.success).toBe(true);
            expect(response.data).toBeNull();
        });

        it('should create a valid success response with undefined data', () => {
            const response: ActionResponse<undefined> = {
                success: true,
                data: undefined
            };

            expect(response.success).toBe(true);
            expect(response.data).toBeUndefined();
        });
    });

    describe('Error Response', () => {
        it('should create a valid error response with error message', () => {
            const response: ActionResponse<any> & { data?: undefined }= {
                success: false,
                error: 'Something went wrong'
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe('Something went wrong');
            expect(response.data).toBeUndefined();
        });

        it('should create a valid error response with code', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe('Validation failed');
            expect(response.code).toBe(ErrorCodes.VALIDATION_ERROR);
        });

        it('should create a valid error response with details', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR,
                details: { field: 'email', message: 'Invalid email format' }
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe('Validation failed');
            expect(response.code).toBe(ErrorCodes.VALIDATION_ERROR);
            expect(response.details).toEqual({ field: 'email', message: 'Invalid email format' });
        });

        it('should create a valid error response with all optional fields', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Database error',
                code: ErrorCodes.DATABASE_ERROR,
                details: { query: 'SELECT * FROM users' }
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe('Database error');
            expect(response.code).toBe(ErrorCodes.DATABASE_ERROR);
            expect(response.details).toEqual({ query: 'SELECT * FROM users' });
        });
    });

    describe('Type Discriminant', () => {
        it('should correctly discriminate between success and error responses', () => {
            const successResponse: ActionResponse<string> = {
                success: true,
                data: 'success'
            };

            const errorResponse: ActionResponse<string> = {
                success: false,
                error: 'error'
            };

            // Type guards
            if (successResponse.success) {
                // TypeScript should know data is string here
                expect(typeof successResponse.data).toBe('string');
            }

            if (!errorResponse.success) {
                // TypeScript should know error is string here
                expect(typeof errorResponse.error).toBe('string');
            }
        });

        it('should allow checking response type at runtime', () => {
            const responses = [
                { success: true, data: 'valid' } as ActionResponse<string>,
                { success: false, error: 'invalid' } as ActionResponse<string>,
                { success: true, data: 123 } as ActionResponse<number>,
                { success: false, error: 'not found', code: ErrorCodes.RIDE_NOT_FOUND } as ActionResponse<number>
            ];

            responses.forEach(response => {
                if (response.success) {
                    const successResp = response as ActionResponse<string | number> & { error?: undefined };
                    expect(successResp.error).toBeUndefined();
                    expect(successResp.data).toBeDefined();
                } else {
                    const errorResp = response as ActionResponse<string | number> & { data?: undefined };
                    expect(errorResp.error).toBeDefined();
                    expect(errorResp.data).toBeUndefined();
                }
            });
        });
    });
});

describe('ErrorCodes', () => {
    describe('Ride Errors', () => {
        it('should have all ride error codes', () => {
            expect(ErrorCodes.RIDE_NOT_FOUND).toBe('RIDE_NOT_FOUND');
            expect(ErrorCodes.RIDE_NOT_AVAILABLE).toBe('RIDE_NOT_AVAILABLE');
            expect(ErrorCodes.RIDE_ALREADY_ASSIGNED).toBe('RIDE_ALREADY_ASSIGNED');
        });
    });

    describe('Driver Errors', () => {
        it('should have all driver error codes', () => {
            expect(ErrorCodes.DRIVER_NOT_FOUND).toBe('DRIVER_NOT_FOUND');
            expect(ErrorCodes.DRIVER_NOT_AVAILABLE).toBe('DRIVER_NOT_AVAILABLE');
            expect(ErrorCodes.MAX_REQUESTS_EXCEEDED).toBe('MAX_REQUESTS_EXCEEDED');
        });
    });

    describe('Customer Errors', () => {
        it('should have all customer error codes', () => {
            expect(ErrorCodes.CUSTOMER_NOT_FOUND).toBe('CUSTOMER_NOT_FOUND');
        });
    });

    describe('Assignment Errors', () => {
        it('should have all assignment error codes', () => {
            expect(ErrorCodes.ASSIGNMENT_ERROR).toBe('ASSIGNMENT_ERROR');
            expect(ErrorCodes.ASSIGNMENT_REQUEST_NOT_FOUND).toBe('ASSIGNMENT_REQUEST_NOT_FOUND');
        });
    });

    describe('Auth Errors', () => {
        it('should have all auth error codes', () => {
            expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
            expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED');
            expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN');
        });
    });

    describe('Database and Generic Errors', () => {
        it('should have all database and generic error codes', () => {
            expect(ErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR');
            expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
        });
    });

    describe('All Error Codes', () => {
        it('should have all expected error codes', () => {
            const expectedErrorCodes = [
                'RIDE_NOT_FOUND',
                'RIDE_NOT_AVAILABLE',
                'RIDE_ALREADY_ASSIGNED',
                'DRIVER_NOT_FOUND',
                'DRIVER_NOT_AVAILABLE',
                'MAX_REQUESTS_EXCEEDED',
                'CUSTOMER_NOT_FOUND',
                'ASSIGNMENT_ERROR',
                'ASSIGNMENT_REQUEST_NOT_FOUND',
                'VALIDATION_ERROR',
                'UNAUTHORIZED',
                'FORBIDDEN',
                'DATABASE_ERROR',
                'INTERNAL_ERROR'
            ];

            Object.values(ErrorCodes).forEach(code => {
                expect(expectedErrorCodes).toContain(code);
            });

            expect(Object.keys(ErrorCodes).length).toBe(expectedErrorCodes.length);
        });

        it('should have unique error codes', () => {
            const errorValues = Object.values(ErrorCodes);
            const uniqueValues = new Set(errorValues);

            expect(errorValues.length).toBe(uniqueValues.size);
        });
    });

    describe('Error Code Usage Patterns', () => {
        it('should have error codes that follow naming conventions', () => {
            Object.values(ErrorCodes).forEach(code => {
                // All codes should be uppercase with underscores
                expect(code).toMatch(/^[A-Z_]+$/);
            });
        });

        it('should have error codes that are descriptive', () => {
            Object.values(ErrorCodes).forEach(code => {
                // All codes should be at least 5 characters long
                expect(code.length).toBeGreaterThanOrEqual(5);
            });
        });

        it('should categorize error codes by domain', () => {
            const rideErrors = Object.values(ErrorCodes).filter(code => code.startsWith('RIDE_'));
            const driverErrors = Object.values(ErrorCodes).filter(code => code.startsWith('DRIVER_'));
            const customerErrors = Object.values(ErrorCodes).filter(code => code.startsWith('CUSTOMER_'));
            const assignmentErrors = Object.values(ErrorCodes).filter(code => code.startsWith('ASSIGNMENT_'));
            const authErrors = Object.values(ErrorCodes).filter(code => 
                code.startsWith('VALIDATION_') || code.startsWith('UNAUTHORIZED') || code.startsWith('FORBIDDEN')
            );
            const genericErrors = Object.values(ErrorCodes).filter(code => 
                code.startsWith('DATABASE_') || code.startsWith('INTERNAL_')
            );

            expect(rideErrors.length).toBeGreaterThan(0);
            expect(driverErrors.length).toBeGreaterThan(0);
            expect(customerErrors.length).toBeGreaterThan(0);
            expect(assignmentErrors.length).toBeGreaterThan(0);
            expect(authErrors.length).toBeGreaterThan(0);
            expect(genericErrors.length).toBeGreaterThan(0);
        });
    });
});

describe('ActionResponse Usage Examples', () => {
    describe('Real-world Scenarios', () => {
        it('should model a successful ride creation response', () => {
            const response: ActionResponse<number> = {
                success: true,
                data: 123
            };

            expect(response.success).toBe(true);
            expect(response.data).toBe(123);
        });

        it('should model a failed ride fetch due to not found', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Ride not found',
                code: ErrorCodes.RIDE_NOT_FOUND
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe('Ride not found');
            expect(response.code).toBe(ErrorCodes.RIDE_NOT_FOUND);
        });

        it('should model a validation error with details', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Invalid input',
                code: ErrorCodes.VALIDATION_ERROR,
                details: {
                    errors: [
                        { field: 'email', message: 'Invalid email format' },
                        { field: 'password', message: 'Password too short' }
                    ]
                }
            };

            expect(response.success).toBe(false);
            expect(response.code).toBe(ErrorCodes.VALIDATION_ERROR);
            expect(response.details).toBeDefined();
        });

        it('should model an unauthorized access error', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Authentication required',
                code: ErrorCodes.UNAUTHORIZED
            };

            expect(response.success).toBe(false);
            expect(response.code).toBe(ErrorCodes.UNAUTHORIZED);
        });

        it('should model a forbidden access error', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Admin access required',
                code: ErrorCodes.FORBIDDEN
            };

            expect(response.success).toBe(false);
            expect(response.code).toBe(ErrorCodes.FORBIDDEN);
        });

        it('should model a database error', () => {
            const response: ActionResponse<any> = {
                success: false,
                error: 'Database connection failed',
                code: ErrorCodes.DATABASE_ERROR,
                details: { error: 'Connection timeout' }
            };

            expect(response.success).toBe(false);
            expect(response.code).toBe(ErrorCodes.DATABASE_ERROR);
        });

        it('should model a list of rides response', () => {
            const rides = [
                { id: 1, departure: 'Paris', destination: 'Lyon' },
                { id: 2, departure: 'Marseille', destination: 'Nice' }
            ];

            const response: ActionResponse<typeof rides> = {
                success: true,
                data: rides
            };

            expect(response.success).toBe(true);
            expect(response.data).toHaveLength(2);
        });

        it('should model a paginated response', () => {
            const response: ActionResponse<{
                rides: any[];
                total: number;
                page: number;
                limit: number;
            }> = {
                success: true,
                data: {
                    rides: [],
                    total: 0,
                    page: 1,
                    limit: 20
                }
            };

            expect(response.success).toBe(true);
            expect(response.data.total).toBe(0);
        });
    });

    describe('Response Formatting', () => {
        it('should have consistent response structure for success', () => {
            const response: ActionResponse<string> = {
                success: true,
                data: 'test'
            };

            expect(Object.keys(response).sort()).toEqual(['data', 'success']);
        });

        it('should have consistent response structure for error without code', () => {
            const response: ActionResponse<string> = {
                success: false,
                error: 'test error'
            };

            expect(Object.keys(response).sort()).toEqual(['error', 'success']);
        });

        it('should have consistent response structure for error with all fields', () => {
            const response: ActionResponse<string> = {
                success: false,
                error: 'test error',
                code: ErrorCodes.INTERNAL_ERROR,
                details: { info: 'extra' }
            };

            expect(Object.keys(response).sort()).toEqual(['code', 'details', 'error', 'success']);
        });
    });
});
