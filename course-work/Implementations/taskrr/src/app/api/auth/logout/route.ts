import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL('/login', req.url);
  const response = NextResponse.redirect(url);
  response.cookies.set('token', '', { path: '/', expires: new Date(0) });
  return response;
}
