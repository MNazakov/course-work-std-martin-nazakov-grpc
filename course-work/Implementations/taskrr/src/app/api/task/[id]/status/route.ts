import { UpdateTaskStatusRequest } from '@generated/task';
import { NextRequest, NextResponse } from 'next/server';
import { getTaskServiceClient } from 'src/lib/grpcClients';
import { getAuthMetadata } from 'src/lib/tokenUtil';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { status } = await req.json();

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  if (status === undefined || isNaN(Number(status))) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const taskServiceClient = getTaskServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = UpdateTaskStatusRequest.fromPartial({
    taskId: parseInt(id, 10),
    status: parseInt(status, 10),
  });

  return new Promise((resolve) => {
    taskServiceClient.updateTaskStatus(request, metadata, (err, response) => {
      if (err || !response.success) {
        return resolve(
          NextResponse.json(
            { error: 'Failed to update task status' },
            { status: 500 }
          )
        );
      }

      resolve(NextResponse.json({ success: true }));
    });
  });
}
