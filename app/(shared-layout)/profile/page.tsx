"use client"

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { api } from '@/convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Lock, FileText, Pencil, Save, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface UserProfile {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export default  function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [editName, setEditName] = useState('')
    const [isUpdatingName, setIsUpdatingName] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const router = useRouter()

    // Get user profile data
    const userProfile = useQuery(api.posts.getUserProfile) as UserProfile | null | undefined
    const postsCount = useQuery(api.posts.getUserPostsCount) as number | undefined
    
    // Delete user data mutation
    const deleteUserData = useMutation(api.posts.deleteUserData)

    // Initialize edit name from profile when available
    useEffect(() => {
        if (userProfile?.name) {
            setEditName(userProfile.name)
        }
    }, [userProfile?.name])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await authClient.getSession()
                if (!data?.session) {
                    router.push('/auth/login?callbackUrl=/profile')
                } else {
                    setIsAuthenticated(true)
                }
            } catch {
                router.push('/auth/login?callbackUrl=/profile')
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [router])

    const handleUpdateName = async () => {
        if (!editName.trim()) {
            toast.error("Name cannot be empty")
            return
        }

        if (editName === userProfile?.name) {
            toast.info("No changes to save")
            return
        }

        setIsUpdatingName(true)
        try {
            await authClient.updateUser({
                name: editName.trim(),
            })
            toast.success("Name updated successfully!")
        } catch (error: any) {
            toast.error(error.error?.message || "Failed to update name")
        } finally {
            setIsUpdatingName(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string
        const currentPassword = formData.get('currentPassword') as string

        if (!currentPassword.trim()) {
            toast.error("Current password is required")
            return
        }

        if (!newPassword.trim()) {
            toast.error("New password cannot be empty")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        try {
            await authClient.changePassword({
                newPassword,
                currentPassword,
            });
            toast.success("Password updated successfully!");
            // Reset form
            (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            toast.error(error.error?.message || "Failed to update password")
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            // First delete all user data from Convex
            await deleteUserData()
            
            // Sign out the user
            await authClient.signOut()
            
            toast.success("Account data deleted successfully!")
            router.push("/")
        } catch (error: any) {
            toast.error(error.error?.message || "Failed to delete account data")
        } finally {
            setIsDeleting(false)
            setShowDeleteDialog(false)
        }
    }

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    // Get display name from profile
    const displayName = userProfile?.name || 'User'
    const displayEmail = userProfile?.email || 'user@example.com'

    return (
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl'>
            <div className='space-y-8'>
                {/* Profile Header */}
                <div className='flex flex-col md:flex-row items-center gap-6'>
                    <Avatar className='h-24 w-24'>
                        <AvatarImage src={userProfile?.image || undefined} alt={displayName} />
                        <AvatarFallback className='text-2xl'>
                            {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className='text-center md:text-left'>
                        <h1 className='text-3xl font-bold'>{displayName}</h1>
                        <p className='text-muted-foreground'>{displayEmail}</p>
                        <div className='flex items-center justify-center md:justify-start gap-2 mt-2 text-sm text-muted-foreground'>
                            <FileText className='h-4 w-4' />
                            <span>{postsCount || 0} posts created</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Update Name Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <User className='h-5 w-5' />
                            Update Name
                        </CardTitle>
                        <CardDescription>
                            Change your display name
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder='Your name'
                                className='flex-1'
                            />
                            <Button 
                                onClick={handleUpdateName} 
                                disabled={!editName.trim() || isUpdatingName}
                                className='gap-2'
                            >
                                {isUpdatingName ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <Save className='h-4 w-4' />
                                )}
                                Save
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Update Password Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Lock className='h-5 w-5' />
                            Update Password
                        </CardTitle>
                        <CardDescription>
                            Change your password (minimum 8 characters)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className='space-y-4'>
                            <Field>
                                <FieldLabel>Current Password</FieldLabel>
                                <Input
                                    name='currentPassword'
                                    type='password'
                                    placeholder='Enter current password'
                                />
                            </Field>
                            <Field>
                                <FieldLabel>New Password</FieldLabel>
                                <Input
                                    name='newPassword'
                                    type='password'
                                    placeholder='Enter new password'
                                />
                            </Field>
                            <Field>
                                <FieldLabel>Confirm Password</FieldLabel>
                                <Input
                                    name='confirmPassword'
                                    type='password'
                                    placeholder='Confirm new password'
                                />
                            </Field>
                            <Button type='submit' className='gap-2'>
                                <Lock className='h-4 w-4' />
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Delete Account Section */}
                <Card className='border-destructive/50'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-destructive'>
                            <Trash2 className='h-5 w-5' />
                            Delete Account Data
                        </CardTitle>
                        <CardDescription>
                            Permanently delete your account, all posts, and comments. This action cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant='destructive' className='gap-2'>
                                    <Trash2 className='h-4 w-4' />
                                    Delete My Account Data
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className='flex items-center gap-2 text-destructive'>
                                        <AlertTriangle className='h-5 w-5' />
                                        Are you sure?
                                    </DialogTitle>
                                    <DialogDescription>
                                        This will permanently delete all your posts and comments from the database, 
                                        and sign you out. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button 
                                        variant='outline' 
                                        onClick={() => setShowDeleteDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant='destructive' 
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className='h-4 w-4 mr-2' />
                                                Delete Account Data
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <FileText className='h-5 w-5' />
                            Quick Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-wrap gap-4'>
                            <Link href='/create'>
                                <Button variant='outline' className='gap-2'>
                                    <Pencil className='h-4 w-4' />
                                    Create New Post
                                </Button>
                            </Link>
                            <Link href='/blog'>
                                <Button variant='outline' className='gap-2'>
                                    <FileText className='h-4 w-4' />
                                    Browse Blogs
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
