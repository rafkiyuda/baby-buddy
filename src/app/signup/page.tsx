'use client'

import { useActionState } from 'react'
import { signup } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

const initialState: {
    message: string;
    errors?: {
        username?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
} = {
    message: '',
}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-0 glass">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Create Account</CardTitle>
                    <CardDescription className="text-center">
                        Join BebyNest to track your child's growth
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="johndoe" required className="bg-background/50" />
                            {state?.errors?.username && (
                                <p className="text-destructive text-xs">{state.errors.username[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required className="bg-background/50" />
                            {state?.errors?.password && (
                                <p className="text-destructive text-xs">{state.errors.password[0]}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required className="bg-background/50" />
                            {state?.errors?.confirmPassword && (
                                <p className="text-destructive text-xs">{state.errors.confirmPassword[0]}</p>
                            )}
                        </div>
                        {state?.message && (
                            <p className="text-destructive text-sm text-center">{state.message}</p>
                        )}
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isPending}>
                            {isPending ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
