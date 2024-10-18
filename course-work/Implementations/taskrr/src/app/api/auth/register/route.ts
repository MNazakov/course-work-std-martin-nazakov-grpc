import { NextResponse } from 'next/server';
import { RegisterUserRequest } from '@generated/auth';
import { status } from '@grpc/grpc-js';
import { getAuthServiceClient } from 'src/lib/grpcClients';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    );
  }

  const authServiceClient = getAuthServiceClient();

  const request = RegisterUserRequest.fromPartial({
    username,
    password,
  });

  return new Promise((resolve) => {
    authServiceClient.registerUser(request, (err, response) => {
      if (err) {
        if (err.code === status.ALREADY_EXISTS) {
          return resolve(
            NextResponse.json({ error: 'User already exists' }, { status: 409 })
          );
        }
        return resolve(
          NextResponse.json({ error: 'Registration failed' }, { status: 500 })
        );
      }

      if (!response || !response.success) {
        return resolve(
          NextResponse.json({ error: 'Registration failed' }, { status: 500 })
        );
      }

      resolve(NextResponse.json({ message: 'Registration successful' }));
    });
  });
}
