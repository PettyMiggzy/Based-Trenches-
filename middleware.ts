import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const seen = request.cookies.get('bt_intro_seen')
    if (seen) return NextResponse.next()
    return NextResponse.redirect(new URL('/intro', request.url))
}

export const config = {
    matcher: ['/((?!intro|_next|favicon.ico|.*\\..*).*)'],
}
