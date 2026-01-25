"use client"

import { signUpSchema } from '@/app/schemas/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { fields } from '@hookform/resolvers/ajv/src/__tests__/__fixtures__/data.js'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'

function SignUpPage() {
    const form = useForm({
        resolver:zodResolver(signUpSchema),
        defaultValues:{
            name:'',
            email:'',
            password:'',
        },

    });

    function onSubmit(){
        console.log("sign up...");

    }
  return (
    <Card>
        <CardHeader>
            <CardTitle>
                Sign up
            </CardTitle>
            <CardDescription>
                Create a new account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className='gap-y-4'>
                    <Controller name='name' control={form.control} render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>
                                Full Name
                            </FieldLabel>
                            <Input aria-invalid={fieldState.invalid} placeholder='John Doe' {...field} />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]}/>
                            )}
                        </Field>
                    )} />
                    <Controller name='email' control={form.control} render={({field,fieldState})=>(
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
                    <Controller name='password' control={form.control} render={({field,fieldState})=>(
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

                    <Button>
                        Sign Up
                    </Button>
                </FieldGroup>
            </form>
        </CardContent>
    </Card>
  )
}

export default SignUpPage