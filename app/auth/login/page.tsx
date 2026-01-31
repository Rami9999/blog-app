"use client"

import { loginSchema } from '@/app/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { useEffect, useState } from 'react'

function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    
    // Initialize form unconditionally
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    
    // Check if user is already authenticated and redirect to blog
    useEffect(() => {
        authClient.getSession().then(({ data }) => {
            if (data?.session) {
                // User is already logged in, redirect to blog or callback URL
                const callbackUrl = searchParams.get('callbackUrl') || '/blog';
                window.location.href = callbackUrl;
            } else {
                setIsLoading(false);
            }
        }).catch(() => {
            setIsLoading(false);
        });
    }, [router, searchParams]);
    
    function onSubmit(data: z.infer<typeof loginSchema>) {
        startTransition(async () => {
            await authClient.signIn.email({
                email: data.email,
                password: data.password,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Logged in successfully!");
                        // Use window.location for hard redirect to ensure auth state is recognized
                        const callbackUrl = searchParams.get('callbackUrl') || '/blog';
                        window.location.href = callbackUrl;
                    },
                    onError: (error) => {
                        toast.error(error.error.message);
                    }
                }
            });
        });
    }

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <p className='text-muted-foreground'>Loading...</p>
            </div>
        );
    }

  return (
    <Card>
        <CardHeader>
            <CardTitle>
                Login
            </CardTitle>
            <CardDescription>
                Log into your Account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className='gap-y-4'>
                    <Controller name='email' control={form.control} render={({field, fieldState}) => (
                        <Field>
                            <FieldLabel>
                                Email
                            </FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='john.doe@gmail.com' type="email" {...field} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]}/>
                            )}
                        </Field>
                    )} />
                    <Controller name='password' control={form.control} render={({field, fieldState}) => (
                        <Field>
                            <FieldLabel>
                                Password
                            </FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='********' type="password" {...field} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]}/>
                            )}
                        </Field>
                    )} />

                    <Button disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className='size-4 animate-spin'/>
                                <span>Loading...</span>
                            </>
                        ):(
                            <span>Log in</span>
                        )}
                    </Button>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
  )
}

export default LoginPage
