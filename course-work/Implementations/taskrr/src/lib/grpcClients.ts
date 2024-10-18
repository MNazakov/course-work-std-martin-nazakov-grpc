import { AuthServiceClient } from '@generated/auth';
import { BoardServiceClient } from '@generated/board';
import { TaskServiceClient } from '@generated/task';
import { ChannelCredentials } from '@grpc/grpc-js';

const javaGrpcUrl =
  process.env.NEXT_PUBLIC_JAVA_GRPC_API_URL || 'localhost:9090';

let authClient: AuthServiceClient | null = null;
let boardClient: BoardServiceClient | null = null;
let taskClient: TaskServiceClient | null = null;

export function getAuthServiceClient() {
  if (!authClient) {
    authClient = new AuthServiceClient(
      javaGrpcUrl,
      ChannelCredentials.createInsecure()
    );
  }
  return authClient;
}

export function getBoardServiceClient() {
  if (!boardClient) {
    boardClient = new BoardServiceClient(
      javaGrpcUrl,
      ChannelCredentials.createInsecure()
    );
  }
  return boardClient;
}

export function getTaskServiceClient() {
  if (!taskClient) {
    taskClient = new TaskServiceClient(
      javaGrpcUrl,
      ChannelCredentials.createInsecure()
    );
  }
  return taskClient;
}
