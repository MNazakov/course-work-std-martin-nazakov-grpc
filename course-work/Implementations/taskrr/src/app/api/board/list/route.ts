import { NextRequest, NextResponse } from 'next/server';
import { getAuthMetadata } from 'src/lib/tokenUtil';
import { ListBoardsRequest } from '@generated/board';
import { getBoardServiceClient } from 'src/lib/grpcClients';

export async function GET(req: NextRequest) {
  const boardServiceClient = getBoardServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = ListBoardsRequest.create();

  return new Promise((resolve) => {
    boardServiceClient.listBoards(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: 'Failed to list boards' }, { status: 500 })
        );
      }

      resolve(NextResponse.json({ boards: response.boards }));
    });
  });
}
