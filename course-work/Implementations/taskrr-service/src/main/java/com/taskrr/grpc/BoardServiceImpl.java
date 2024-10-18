package com.taskrr.grpc;

import com.taskrr.entity.Board;
import com.taskrr.entity.User;
import com.taskrr.repository.BoardRepository;
import com.taskrr.repository.TaskRepository;
import com.taskrr.repository.UserRepository;
import io.grpc.Context;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.taskrr.grpc.auth.AuthInterceptor.USER_ID_CONTEXT_KEY;

@GrpcService
public class BoardServiceImpl extends BoardServiceGrpc.BoardServiceImplBase {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public void getBoardById(GetBoardByIdRequest request, StreamObserver<GetBoardByIdResponse> responseObserver) {
        int boardId = request.getId();
        Optional<Board> boardOptional = boardRepository.findById(boardId);

        if (boardOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("Board not found").asRuntimeException());
            return;
        }

        Board board = boardOptional.get();

        List<com.taskrr.entity.Task> tasks = taskRepository.findByBoardId(boardId);

        com.taskrr.grpc.Board.Builder boardBuilder = com.taskrr.grpc.Board.newBuilder()
                .setId(board.getId())
                .setName(board.getName())
                .setDescription(board.getDescription())
                .setCreatedAt(board.getCreatedAt().toString());

        for (com.taskrr.entity.Task task : tasks) {
            boardBuilder.addTasks(com.taskrr.grpc.Task.newBuilder()
                    .setId(task.getId())
                    .setTitle(task.getTitle())
                    .setDescription(task.getDescription())
                    .setStatus(com.taskrr.grpc.TaskStatus.valueOf(task.getStatus().name()))
                    .setCreatedAt(task.getCreatedAt().toString())
                    .build());
        }

        GetBoardByIdResponse response = GetBoardByIdResponse.newBuilder()
                .setBoard(boardBuilder.build())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
    @Override
    public void createBoard(CreateBoardRequest request, StreamObserver<CreateBoardResponse> responseObserver) {
        Integer userId = USER_ID_CONTEXT_KEY.get(Context.current());

        if (userId == null) {
            responseObserver.onError(Status.UNAUTHENTICATED.withDescription("User ID not found in context").asRuntimeException());
            return;
        }

        Optional<com.taskrr.entity.User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("User not found").asRuntimeException());
            return;
        }

        User user = userOptional.get();

        Board newBoard = new Board();
        newBoard.setName(request.getName());
        newBoard.setDescription(request.getDescription());
        newBoard.setCreatedAt(LocalDateTime.now());
        newBoard.setUser(user);

        Board savedBoard = boardRepository.save(newBoard);

        CreateBoardResponse response = CreateBoardResponse.newBuilder()
                .setBoard(com.taskrr.grpc.Board.newBuilder()
                        .setId(savedBoard.getId())
                        .setName(savedBoard.getName())
                        .setDescription(savedBoard.getDescription())
                        .setCreatedAt(savedBoard.getCreatedAt().toString())
                        .build())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void listBoards(ListBoardsRequest request, StreamObserver<ListBoardsResponse> responseObserver) {
        Integer userId = USER_ID_CONTEXT_KEY.get(Context.current());

        if (userId == null) {
            responseObserver.onError(Status.UNAUTHENTICATED.withDescription("User ID not found in context").asRuntimeException());
            return;
        }

        List<Board> boards = boardRepository.findByUserId(userId);

        ListBoardsResponse.Builder responseBuilder = ListBoardsResponse.newBuilder();
        for (Board board : boards) {
            responseBuilder.addBoards(com.taskrr.grpc.Board.newBuilder()
                    .setId(board.getId())
                    .setName(board.getName())
                    .setDescription(board.getDescription())
                    .setCreatedAt(board.getCreatedAt().toString())
                    .build());
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    @Transactional
    public void deleteBoard(DeleteBoardRequest request, StreamObserver<DeleteBoardResponse> responseObserver) {
        int boardId = request.getId();

        Optional<Board> boardOptional = boardRepository.findById(boardId);
        if (boardOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription("Board not found")
                    .asRuntimeException());
            return;
        }

        taskRepository.deleteByBoardId(boardId);

        boardRepository.deleteById(boardId);

        DeleteBoardResponse response = DeleteBoardResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
