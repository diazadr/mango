import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

// 1. Inisialisasi middleware i18n
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. Jalankan middleware i18n terlebih dahulu (untuk deteksi bahasa & redirect otomatis)
    const response = intlMiddleware(request);

    // 2b. Jika path root '/', langsung redirect ke /id
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/id', request.url));
    }

    // 3. Ambil locale dari pathname atau headers untuk logika auth
    const segments = pathname.split('/');
    const locale = segments[1] || 'id';

    // Path tanpa locale untuk pengecekan yang lebih akurat (misal: /id/dashboard -> /dashboard)
    const pathWithoutLocale = segments.length > 2 ? `/${segments.slice(2).join('/')}` : '/';

    // 4. Definisi Halaman Publik & Terproteksi (Gunakan startsWith agar lebih presisi)
    const isAuthPage = pathWithoutLocale.startsWith('/login') ||
                      pathWithoutLocale.startsWith('/register') ||
                      pathWithoutLocale.startsWith('/forgot-password') ||
                      pathWithoutLocale.startsWith('/reset-password');

    const isDashboardPage = pathWithoutLocale.startsWith('/dashboard') ||
                           pathWithoutLocale.startsWith('/profile') ||
                           pathWithoutLocale.startsWith('/onboarding') ||
                           pathWithoutLocale.startsWith('/verify-email');

    // 5. Skip validasi auth jika bukan auth page atau dashboard page
    if (!isAuthPage && !isDashboardPage) {
        return response;
    }

    // 6. Validasi session ke backend
    let isAuthenticated = false;
    let isEmailVerified = false;
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const cookieHeader = request.headers.get('cookie') || '';
        const timestamp = new Date().getTime();
        
        const apiResponse = await fetch(`${backendUrl}/api/v1/me?t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': cookieHeader,
                'Referer': request.url,
                'ngrok-skip-browser-warning': '69420',
                'Bypass-Tunnel-Reminder': 'true',
            },
            cache: 'no-store',
        });
        
        if (apiResponse.ok) {
            const json = await apiResponse.json();
            const userData = json.data?.user || json.data || json;
            
            isAuthenticated = true;
            isEmailVerified = userData && userData.email_verified_at !== null && userData.email_verified_at !== undefined;
        }
    } catch (err) {
        console.error('[Middleware Error]', err);
        isAuthenticated = false;
    }

    // LOGIKA PROTEKSI REDIRECT:
    
    // Gunakan helper URL untuk redirect agar tetap menjaga locale yang terdeteksi
    const createRedirect = (targetPath: string) => {
        return NextResponse.redirect(new URL(`/${locale}${targetPath}`, request.url));
    };

    // 1. JIKA SUDAH LOGIN & SUDAH VERIFIKASI -> Dilarang ke VerifyEmail
    if (isAuthenticated && isEmailVerified && pathWithoutLocale.startsWith('/verify-email')) {
        return createRedirect('/dashboard');
    }

    // 2. JIKA SUDAH LOGIN TAPI BELUM VERIFIKASI -> Wajib ke verify-email
    if (isAuthenticated && !isEmailVerified && isDashboardPage && !pathWithoutLocale.startsWith('/verify-email')) {
        return createRedirect('/verify-email');
    }

    // 3. JIKA SUDAH LOGIN & SUDAH VERIFIKASI -> Dilarang ke Login/Register
    if (isAuthenticated && isEmailVerified && isAuthPage) {
        return createRedirect('/dashboard');
    }

    // 4. JIKA BELUM LOGIN -> Wajib ke login
    if (!isAuthenticated && isDashboardPage) {
        return createRedirect('/login');
    }

    return response;
}

export const config = {
    matcher: [
        // Tangkap root path agar redirect ke locale default
        '/',
        // Tangkap SEMUA rute kecuali file statis, images, dan api
        '/((?!api|_next/static|_next/image|favicon.ico|images|favicon).*)',
    ],
};
