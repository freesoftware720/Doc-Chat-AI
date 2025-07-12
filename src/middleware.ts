
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn("Supabase environment variables are missing or are placeholders. The application will continue without authentication features, but API calls to Supabase will fail. Please check your .env.local file.");
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  // Allow access to the splash screen regardless of auth state
  if (pathname === '/splash') {
      return response;
  }

  const isAuthPage = pathname.startsWith('/auth')
  const isSelectPlanPage = pathname === '/auth/select-plan'
  const isAppPage = pathname.startsWith('/app')

  if (user) {
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', user.id)
        .single();
    const hasSelectedPlan = !!profile?.subscription_plan;
    
    // Redirect a user with no plan to the selection page if they access the app
    if (!hasSelectedPlan && isAppPage) {
      return NextResponse.redirect(new URL('/auth/select-plan', request.url));
    }
    
    // Redirect a user with a plan away from the selection page
    if (hasSelectedPlan && isSelectPlanPage) {
        return NextResponse.redirect(new URL('/app', request.url));
    }

    // Redirect logged-in users from general auth pages to the app
    if (isAuthPage && !isSelectPlanPage) {
      return NextResponse.redirect(new URL('/app', request.url))
    }
  } else {
    // Redirect logged-out users from protected pages
    if (isAppPage || isSelectPlanPage) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
