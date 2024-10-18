import { LoginUserRequest } from '@generated/auth';
import { NextResponse } from 'next/server';
import { getAuthServiceClient } from 'src/lib/grpcClients';
import { setAuthCookie } from 'src/lib/tokenUtil';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const authServiceClient = getAuthServiceClient();

  const request = LoginUserRequest.create({
    username,
    password,
  });

  return new Promise((resolve) => {
    authServiceClient.loginUser(request, (err, response) => {
      if (err || !response || !response.token) {
        return resolve(
          NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        );
      }

      const token = response.token;
      setAuthCookie(token);

      const url = new URL('/dashboard', req.url);
      resolve(NextResponse.redirect(url));
    });
  });
}
