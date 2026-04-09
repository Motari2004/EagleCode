// middleware.ts (place in root of your Next.js project, same level as app folder)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RENDER_API_URL = 'https://eaglecode2-1.onrender.com';
const LOCAL_API_URL = 'http://localhost:8000';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only handle /api/* requests
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip if it's a Next.js internal API
  if (path.includes('/_next/')) {
    return NextResponse.next();
  }
  
  // Determine which backend to use
  const buildEndpoints = [
    '/api/generate-preview',
    '/api/regenerate-preview', 
    '/api/edit-file',
    '/api/edit-batch',
    '/api/search-images',
    '/api/generate-static-preview',
  ];
  
  const shouldUseRender = buildEndpoints.some(ep => path.includes(ep));
  const isDev = process.env.NODE_ENV === 'development';
  
  let targetUrl: string;
  if (shouldUseRender) {
    targetUrl = `${RENDER_API_URL}${path}`;
    console.log(`🔄 [Middleware] Proxying to Render: ${targetUrl}`);
  } else {
    targetUrl = `${isDev ? LOCAL_API_URL : RENDER_API_URL}${path}`;
    console.log(`🔄 [Middleware] Proxying to ${isDev ? 'Local' : 'Render'}: ${targetUrl}`);
  }
  
  // Add query parameters
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.toString()) {
    targetUrl += `?${searchParams.toString()}`;
  }
  
  try {
    // Clone the request headers
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/json');
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? await request.text() 
        : undefined,
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error(`❌ Middleware proxy error for ${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request', path: path },
      { status: 500 }
    );
  }
}

// Configure which paths to run middleware on
export const config = {
  matcher: '/api/:path*',
};