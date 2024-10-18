import { DeleteTaskRequest } from '@generated/task';
import { NextRequest, NextResponse } from 'next/server';
import { getTaskServiceClient } from 'src/lib/grpcClients';
import { getAuthMetadata } from 'src/lib/tokenUtil';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const taskServiceClient = getTaskServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = DeleteTaskRequest.fromPartial({ id: parseInt(id, 10) });

  return new Promise((resolve) => {
    taskServiceClient.deleteTask(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
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
