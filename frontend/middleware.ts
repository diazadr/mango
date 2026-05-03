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

    // 3. Ambil locale dari pathname atau headers untuk logika auth
    const segments = pathname.split('/');
    const locale = segments[1] || 'id';

    // 4. Definisi Halaman Publik & Terproteksi
    const isAuthPage = pathname.includes('/login') ||
                      pathname.includes('/register') ||
                      pathname.includes('/forgot-password') ||
                      pathname.includes('/reset-password');

    const isDashboardPage = pathname.includes('/dashboard') ||
                           pathname.includes('/profile') ||
                           pathname.includes('/onboarding');

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
    if (isAuthenticated && isEmailVerified && pathname.includes('/verify-email')) {
        return createRedirect('/dashboard');
    }

    // 2. JIKA SUDAH LOGIN TAPI BELUM VERIFIKASI -> Wajib ke verify-email
    if (isAuthenticated && !isEmailVerified && isDashboardPage && !pathname.includes('/verify-email')) {
        return createRedirect('/verify-email');
    }

    // 3. JIKA SUDAH LOGIN & SUDAH VERIFIKASI -> Dilarang ke Login/Register
    if (isAuthenticated && isEmailVerified && isAuthPage) {
        return createRedirect('/dashboard');
    }

    // 4. JIKA BELUM LOGIN -> Wajib ke login
    if (!isAuthenticated && (isDashboardPage || pathname.includes('/verify-email'))) {
        return createRedirect('/login');
    }

    return response;
}

export const config = {
    matcher: [
        // Tangkap SEMUA rute kecuali file statis, images, dan api
        '/((?!api|_next/static|_next/image|favicon.ico|images|favicon).*)',
    ],
};
