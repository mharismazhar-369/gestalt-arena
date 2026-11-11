import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 1. Inject the requested URL path into headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-current-path', request.nextUrl.pathname)

    // 2. Attach headers to downstream response
    let supabaseResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))

                    // Maintain custom headers during cookie sync
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Important: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // Define routes that require authentication
    const protectedRoutes = ['/dashboard', '/settings', '/negotiations', '/startup/pitch/build', '/investor/bids/create']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // If user is not signed in and trying to access a protected route, redirect to login
    if (!user && isProtectedRoute) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is signed in and trying to visit login/signup, redirect to dashboard/feed
    if (user && (pathname === '/login' || pathname === '/signup')) {
        url.pathname = '/feed'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, jpg, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}