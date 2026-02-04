"use client"
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { Button, buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Sparkles, User, LogOut, PenSquare, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserData {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()

    // Get user profile data from Convex
    //const userProfile = useQuery(api.posts.getUserProfile) as UserData | null | undefined

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await authClient.getSession()
                if (data?.session) {
                    setIsAuthenticated(true)
                } else {
                    setIsAuthenticated(false)
                }
            } catch {
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Logged out successfully!")
                        router.push("/")
                        setIsLoggingOut(false)
                    },
                    onError: (error) => {
                        toast.error(error.error.message)
                        setIsLoggingOut(false)
                    }
                }
            })
        } catch (error) {
            toast.error("Failed to logout")
            setIsLoggingOut(false)
        }
    }

    if (isLoading) {
        return (
            <nav className='w-full py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
                <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Link href="/">
                                <h1 className='text-3xl font-bold flex items-center gap-2'>
                                    <span className='relative'>
                                        <span className='bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer'>
                                            RumaBlog
                                        </span>
                                        <Sparkles className='absolute -top-3 -right-4 h-4 w-4 text-primary animate-pulse opacity-80' />
                                    </span>
                                </h1>
                            </Link>
                        </div>
                        <div className='flex items-center gap-3'>
                            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

  return (
    <nav className='w-full py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between'>
                {/* Logo Section */}
                <div className='flex items-center gap-2'>
                    <Link href="/" className='group'>
                        <h1 className='text-3xl font-bold flex items-center gap-2'>
                            <span className='relative'>
                                <span className='bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer'>
                                    RumaBlog
                                </span>
                                <Sparkles className='absolute -top-3 -right-4 h-4 w-4 text-primary animate-pulse opacity-80' />
                            </span>
                        </h1>
                    </Link>
                </div>

                {/* Navigation Links - Hidden on mobile, visible on lg */}
                <div className='hidden lg:flex items-center gap-1'>
                    <Link className={buttonVariants({
                        variant: "ghost",
                        size: "sm"
                    })} href="/">
                        Home
                    </Link>
                    <Link className={buttonVariants({
                        variant: "ghost",
                        size: "sm"
                    })} href="/blog">
                        Blog
                    </Link>
                    {isAuthenticated && (
                        <Link className={buttonVariants({
                            variant: "ghost",
                            size: "sm"
                        })} href="/create">
                            Create
                        </Link>
                    )}
                </div>

                {/* Right Section */}
                <div className='flex items-center gap-3'>
                    <ThemeToggle />
                    
                    {isAuthenticated  ? (
                        // User dropdown menu
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className='flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors'>
                                    <Avatar className='h-8 w-8'>
                                        {/*<AvatarImage src={userProfile.image || undefined} alt={userProfile.name || 'User'} />*/}
                                        <AvatarImage src={undefined} alt={'User'} />
                                        <AvatarFallback className='text-xs'>
                                            {'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end' className='w-56'>
                                {/*<DropdownMenuLabel>
                                    <div className='flex flex-col space-y-1'>
                                        <p className='text-sm font-medium'>{userProfile.name || 'User'}</p>
                                        <p className='text-xs text-muted-foreground'>{userProfile.email}</p>
                                    </div>
                                </DropdownMenuLabel>*/}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className='flex items-center cursor-pointer'>
                                        <User className='mr-2 h-4 w-4' />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/create" className='flex items-center cursor-pointer'>
                                        <PenSquare className='mr-2 h-4 w-4' />
                                        Create Post
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={handleLogout}
                                    className='cursor-pointer text-destructive focus:text-destructive'
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut className='mr-2 h-4 w-4' />
                                            Logout
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // Login/Sign up buttons for unauthenticated users
                        <div className='flex items-center gap-2'>
                            <Link className={buttonVariants({ variant: "ghost", size: "sm" })} href="/auth/login">
                                Login
                            </Link>
                            <Link className={buttonVariants({ size: "sm" })} href="/auth/sign-up">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Logout Loading Overlay */}
        {isLoggingOut && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                <div className='bg-background rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='text-sm text-muted-foreground'>Logging you out...</p>
                </div>
            </div>
        )}
    </nav>
  )
}

export default Navbar
