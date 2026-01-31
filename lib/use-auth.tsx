"use client"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

// Public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/sign-up']

export function useAuth(required: boolean = true) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        // Skip auth check for public routes
        if (publicRoutes.includes(pathname)) {
            setIsLoading(false)
            return
        }

        const checkAuth = async () => {
            try {
                const { data } = await authClient.getSession()
                const isAuth = !!data?.session

                if (required && !isAuth) {
                    // If auth is required but user is not authenticated, redirect to login
                    window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(pathname)
                } else if (!required && isAuth) {
                    // If auth is not required but user is authenticated (e.g., trying to access login page)
                    window.location.href = '/blog'
                }

                setIsAuthenticated(isAuth)
            } catch (error) {
                if (required) {
                    window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(pathname)
                }
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [required, pathname])

    return { isAuthenticated, isLoading }
}

// Protected wrapper component
export function ProtectedRoute({ 
    children,
    fallback 
}: { 
    children: React.ReactNode
    fallback?: React.ReactNode
}) {
    const { isAuthenticated, isLoading } = useAuth(true)

    if (isLoading) {
        return fallback || (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-muted-foreground'>Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
