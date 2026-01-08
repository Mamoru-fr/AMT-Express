'use client'

import {createContext, useContext} from "react";
import {SessionWithUser} from "@/content/database_types/auth";
import {getValidatedRole, isValidUserRole} from "@/utils/isValidUserRole";

export type SessionType = {
    session: SessionWithUser | null;
}

const SessionContext = createContext<SessionType | undefined>(undefined);

export const SessionProvider = ({children, session}: { 
    children: React.ReactNode, 
    session: SessionWithUser | null 
}) => {
    // Optionally log validation warnings in development
    if (process.env.NODE_ENV === 'development' && session?.user?.role) {
        if (!isValidUserRole(session.user.role)) {
            console.warn(`Invalid user role detected: ${session.user.role}. Expected: admin, driver, or customer`);
        }
    }

    return (
        <SessionContext.Provider value={{session}}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

// Custom hook with validated role
export const useSessionWithRole = () => {
    const {session} = useSession();
    const validatedRole = getValidatedRole(session);
    const isAuthenticated = !!session && !!session.user.banned === false;
    
    return {
        session,
        user: session?.user ?? null,
        role: validatedRole,
        isAuthenticated: isAuthenticated,
        isAdmin: validatedRole === 'admin' && isAuthenticated,
        isDriver: validatedRole === 'driver' && isAuthenticated,
        isCustomer: validatedRole === 'customer' && isAuthenticated,
    };
};