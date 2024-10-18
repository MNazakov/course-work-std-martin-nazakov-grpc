import { CreateTaskRequest } from '@generated/task';
import { NextRequest, NextResponse } from 'next/server';
import { getTaskServiceClient } from 'src/lib/grpcClients';
import { getAuthMetadata } from 'src/lib/tokenUtil';

export async function POST(req: NextRequest) {
  const { title, description, boardId, status } = await req.json();

  if (!title || !description || !boardId || status === undefined) {
    return NextResponse.json(
      { error: 'Title, description, board ID, and status are required' },
      { status: 400 }
    );
  }

  const taskServiceClient = getTaskServiceClient();
  const metadata = getAuthMetadata(req);

  if (!metadata) {
    return NextResponse.json(
      { error: 'Authentication token is missing' },
      { status: 401 }
    );
  }

  const request = CreateTaskRequest.create({
    title,
    description,
    boardId,
    status,
  });

  return new Promise((resolve) => {
    taskServiceClient.createTask(request, metadata, (err, response) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
        );
      }

      resolve(
        NextResponse.json({
          message: 'Task created successfully',
          task: response.task,
        })
      );
    });
  });
}
