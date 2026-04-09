// middleware.ts - Place this in your project root (same level as app folder)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log(`🔵 Middleware running for: ${path}`);
  
  // Only handle /api/* requests
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip if it's a Next.js internal API
  if (path.includes('/_next/')) {
    return NextResponse.next();
  }
  
  const RENDER_API_URL = 'https://eaglecode2-1.onrender.com';
  const LOCAL_API_URL = 'http://localhost:8000';
  
  // Define which endpoints go to which backend
  const buildEndpoints = [
    '/api/generate-preview',
    '/api/regenerate-preview', 
    '/api/edit-file',
    '/api/edit-batch',
    '/api/search-images',
    '/api/generate-static-preview',
  ];
  
  const isBuildEndpoint = buildEndpoints.some(ep => path.includes(ep));
  const isDev = process.env.NODE_ENV === 'development';
  
  let targetUrl: string;
  if (isBuildEndpoint) {
    targetUrl = `${RENDER_API_URL}${path}`;
    console.log(`🔄 [Middleware] Build endpoint -> Render: ${targetUrl}`);
  } else {
    // For data endpoints, use local in dev, Render in production
    targetUrl = `${isDev ? LOCAL_API_URL : RENDER_API_URL}${path}`;
    console.log(`🔄 [Middleware] Data endpoint -> ${isDev ? 'Local' : 'Render'}: ${targetUrl}`);
  }
  
  // Add query parameters
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.toString()) {
    targetUrl += `?${searchParams.toString()}`;
  }
  
  try {
    // Forward the request
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch (e) {
        // Body might be empty or not JSON
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    
    // Return the response with CORS headers
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

// IMPORTANT: This config is required for middleware to run on API routes
export const config = {
  matcher: '/api/:path*',
};