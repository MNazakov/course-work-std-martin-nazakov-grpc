package com.taskrr.grpc.auth;

import com.taskrr.entity.User;
import com.taskrr.grpc.*;
import com.taskrr.grpc.auth.utils.JwtUtil;
import com.taskrr.repository.UserRepository;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@GrpcService
public class AuthServiceImpl extends AuthServiceGrpc.AuthServiceImplBase {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthServiceImpl(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void loginUser(LoginUserRequest request, StreamObserver<LoginUserResponse> responseObserver) {
        String username = request.getUsername();
        String password = request.getPassword();

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()) {
            responseObserver.onError(Status.NOT_FOUND.withDescription("User not found").asRuntimeException());
            return;
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            responseObserver.onError(Status.UNAUTHENTICATED.withDescription("Invalid password").asRuntimeException());
            return;
        }

        String token = jwtUtil.generateToken(user.getId());

        LoginUserResponse response = LoginUserResponse.newBuilder()
                .setToken(token)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void registerUser(RegisterUserRequest request, StreamObserver<RegisterUserResponse> responseObserver) {
        String username = request.getUsername();
        String password = request.getPassword();

        // Check if the username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription("Username already taken")
                    .asRuntimeException());
            return;
        }

        // Encrypt the password
        String encodedPassword = passwordEncoder.encode(password);

        // Create a new user entity
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(encodedPassword);

        // Save the user to the database
        userRepository.save(newUser);

        // Build the response
        RegisterUserResponse response = RegisterUserResponse.newBuilder()
                .setSuccess(true)
                .build();

        // Send the response
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
