import { Metadata } from '@grpc/grpc-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export function getAuthMetadata(req: NextRequest): Metadata | null {
  const token = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return null;
  }

  const metadata = new Metadata();
  metadata.set('Authorization', `Bearer ${token}`);
  return metadata;
}

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60,
  });
}
