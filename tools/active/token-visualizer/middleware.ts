import { NextRequest, NextResponse } from 'next/server';

// Simple Basic-Auth gate so internal token data isn't publicly viewable.
// Configure VIZ_USER / VIZ_PASS in Vercel env vars. If either is empty, the
// gate is disabled (handy for local dev or an intentionally public deploy).
export function middleware(req: NextRequest) {
  const USER = process.env.VIZ_USER || '';
  const PASS = process.env.VIZ_PASS || '';
  if (!USER || !PASS) return NextResponse.next();

  const header = req.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(':');
      const u = decoded.slice(0, i);
      const p = decoded.slice(i + 1);
      if (u === USER && p === PASS) return NextResponse.next();
    } catch {
      /* fall through */
    }
  }
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="HighRise Token Visualizer"' },
  });
}

export const config = {
  // gate everything except Next internals & static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
