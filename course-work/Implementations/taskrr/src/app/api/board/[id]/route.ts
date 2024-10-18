import { NextRequest, NextResponse } from 'next/server';
import { getAuthMetadata } from 'src/lib/tokenUtil';
import { DeleteBoardRequest, GetBoardByIdRequest } from '@generated/board';
import { getBoardServiceClient } from 'src/lib/grpcClients';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: 'Board ID is required' },
      { status: 400 }
    );
  }

  const boardServiceClient = getBoardServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = GetBoardByIdRequest.fromPartial({ id: parseInt(id, 10) });

  return new Promise((resolve) => {
    boardServiceClient.getBoardById(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: 'Failed to fetch board' }, { status: 500 })
        );
      }

      resolve(
        NextResponse.json({
          board: response.board,
        })
      );
    });
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Board ID is required' },
      { status: 400 }
    );
  }

  const boardServiceClient = getBoardServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = DeleteBoardRequest.fromPartial({ id: parseInt(id, 10) });

  return new Promise((resolve) => {
    boardServiceClient.deleteBoard(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json(
            { error: 'Failed to delete board' },
            { status: 500 }
          )
        );
      }

      resolve(
        NextResponse.json({
          success: response.success,
        })
      );
    });
  });
}
