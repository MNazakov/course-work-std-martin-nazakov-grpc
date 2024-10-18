package com.taskrr.grpc;

import com.taskrr.entity.Task;
import com.taskrr.entity.Board;
import com.taskrr.repository.BoardRepository;
import com.taskrr.repository.TaskRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@GrpcService
public class TaskServiceImpl extends TaskServiceGrpc.TaskServiceImplBase {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Override
    public void createTask(CreateTaskRequest request, StreamObserver<CreateTaskResponse> responseObserver) {
        int boardId = request.getBoardId();
        Optional<Board> boardOptional = boardRepository.findById(boardId);

        if (boardOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Board not found").asRuntimeException());
            return;
        }

        Board board = boardOptional.get();

        Task newTask = new Task();
        newTask.setTitle(request.getTitle());
        newTask.setDescription(request.getDescription());
        newTask.setStatus(TaskStatus.valueOf(request.getStatus().name()));
        newTask.setCreatedAt(LocalDateTime.now());
        newTask.setBoard(board);

        Task savedTask = taskRepository.save(newTask);

        CreateTaskResponse response = CreateTaskResponse.newBuilder()
                .setTask(com.taskrr.grpc.Task.newBuilder()
                        .setId(savedTask.getId())
                        .setTitle(savedTask.getTitle())
                        .setDescription(savedTask.getDescription())
                        .setStatus(com.taskrr.grpc.TaskStatus.valueOf(savedTask.getStatus().name()))
                        .setBoardId(savedTask.getBoard().getId())
                        .setCreatedAt(savedTask.getCreatedAt().toString())
                        .build())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateTaskStatus(UpdateTaskStatusRequest request, StreamObserver<UpdateTaskStatusResponse> responseObserver) {
        int taskId = request.getTaskId();
        TaskStatus newStatus = request.getStatus();

        Optional<Task> taskOptional = taskRepository.findById(taskId);
        if (taskOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Task not found").asRuntimeException());
            return;
        }

        Task task = taskOptional.get();

        task.setStatus(TaskStatus.valueOf(newStatus.name()));
        taskRepository.save(task);

        UpdateTaskStatusResponse response = UpdateTaskStatusResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getTasksForBoard(GetTasksForBoardRequest request, StreamObserver<GetTasksForBoardResponse> responseObserver) {
        int boardId = request.getBoardId();
        Optional<Board> boardOptional = boardRepository.findById(boardId);

        if (boardOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Board not found").asRuntimeException());
            return;
        }

        Board board = boardOptional.get();
        List<Task> tasks = taskRepository.findByBoardId(board.getId());

        GetTasksForBoardResponse.Builder responseBuilder = GetTasksForBoardResponse.newBuilder();
        for (Task task : tasks) {
            responseBuilder.addTasks(com.taskrr.grpc.Task.newBuilder()
                    .setId(task.getId())
                    .setTitle(task.getTitle())
                    .setDescription(task.getDescription())
                    .setStatus(com.taskrr.grpc.TaskStatus.valueOf(task.getStatus().name()))
                    .setBoardId(task.getBoard().getId())
                    .setCreatedAt(task.getCreatedAt().toString())
                    .build());
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void deleteTask(DeleteTaskRequest request, StreamObserver<DeleteTaskResponse> responseObserver) {
        int taskId = request.getId();

        Optional<Task> taskOptional = taskRepository.findById(taskId);
        if (taskOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Task not found").asRuntimeException());
            return;
        }

        taskRepository.deleteById(taskId);

        DeleteTaskResponse response = DeleteTaskResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
