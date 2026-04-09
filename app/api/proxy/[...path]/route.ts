// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RENDER_API_URL = 'https://eaglecode2-1.onrender.com';
const LOCAL_API_URL = 'http://localhost:8000';

const USE_RENDER_ENDPOINTS = [
  '/ws/build',
  '/api/generate-preview',
  '/api/regenerate-preview',
  '/api/edit-file',
  '/api/edit-batch',
  '/api/search-images',
  '/api/generate-static-preview',
];

const USE_LOCAL_ENDPOINTS = [
  '/api/get-projects',
  '/api/get-project',
  '/api/delete-project',
  '/api/save-project',
  '/api/check-name',
  '/api/name-stats',
  '/health',
];

function getTargetUrl(path: string): string {
  if (USE_RENDER_ENDPOINTS.some(endpoint => path.startsWith(endpoint))) {
    return `${RENDER_API_URL}${path}`;
  } else if (USE_LOCAL_ENDPOINTS.some(endpoint => path.startsWith(endpoint))) {
    return `${LOCAL_API_URL}${path}`;
  } else {
    const isDev = process.env.NODE_ENV === 'development';
    return `${isDev ? LOCAL_API_URL : RENDER_API_URL}${path}`;
  }
}

// ✅ FIXED: Use Promise for params in Next.js 16
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  const searchParams = request.nextUrl.searchParams;
  
  console.log(`📨 Proxy GET - Path: ${path}`);
  
  let targetUrl = getTargetUrl(path);
  
  if (searchParams.toString()) {
    targetUrl += `?${searchParams.toString()}`;
  }
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`❌ Proxy error for ${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  
  console.log(`📨 Proxy POST - Path: ${path}`);
  
  let targetUrl = getTargetUrl(path);
  
  try {
    const body = await request.json();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`❌ Proxy POST error for ${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');
  
  console.log(`📨 Proxy DELETE - Path: ${path}`);
  
  let targetUrl = getTargetUrl(path);
  
  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`❌ Proxy DELETE error for ${path}:`, error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}