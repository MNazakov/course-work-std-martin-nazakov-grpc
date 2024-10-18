import { CreateBoardRequest } from '@generated/board';
import { NextRequest, NextResponse } from 'next/server';
import { getBoardServiceClient } from 'src/lib/grpcClients';
import { getAuthMetadata } from 'src/lib/tokenUtil';

export async function POST(req: NextRequest) {
  const { name, description } = await req.json();

  if (!name || !description) {
    return NextResponse.json(
      { error: 'Name and description are required' },
      { status: 400 }
    );
  }

  const boardServiceClient = getBoardServiceClient();
  const request = CreateBoardRequest.fromPartial({ name, description });

  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  return new Promise((resolve) => {
    boardServiceClient.createBoard(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json(
            { error: 'Failed to create board' },
            { status: 500 }
          )
        );
      }

      if (!response || !response.board) {
        return resolve(
          NextResponse.json(
            { error: 'Failed to create board' },
            { status: 500 }
          )
        );
      }

      resolve(
        NextResponse.json({
          message: 'Board created successfully',
          board: response.board,
        })
      );
    });
  });
}
