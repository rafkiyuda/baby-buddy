import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/onboarding']
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isAuthRoute = authRoutes.some(route => path.startsWith(route))

    const sessionCookie = request.cookies.get('session')?.value
    let session = null

    if (sessionCookie) {
        try {
            session = await decrypt(sessionCookie)
        } catch (error) {
            console.error('Middleware session decryption error:', error)
            // Invalid session, treated as null
        }
    }

    // Redirect to /login if trying to access protected route without session
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }

    // Redirect to /dashboard if logged in and trying to access auth routes
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
