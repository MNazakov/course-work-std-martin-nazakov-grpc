package com.taskrr.grpc.auth;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.taskrr.grpc.auth.utils.JwtUtil;
import io.grpc.*;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@GrpcGlobalServerInterceptor
@Component
public class AuthInterceptor implements ServerInterceptor {

    private final JwtUtil jwtUtil;

    public static final Context.Key<Integer> USER_ID_CONTEXT_KEY = Context.key("userId");

    private static final Set<String> IGNORED_ROUTES = new HashSet<>();

    static {
        IGNORED_ROUTES.add("AuthService/RegisterUser");
        IGNORED_ROUTES.add("AuthService/LoginUser");
    }

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    private static final Metadata.Key<String> AUTHORIZATION_METADATA_KEY =
            Metadata.Key.of("Authorization", Metadata.ASCII_STRING_MARSHALLER);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        String fullMethodName = call.getMethodDescriptor().getFullMethodName();

        if (IGNORED_ROUTES.contains(fullMethodName)) {
            return next.startCall(call, headers);
        }

        String token = headers.get(AUTHORIZATION_METADATA_KEY);
        if (token == null || !token.startsWith("Bearer ")) {
            call.close(Status.UNAUTHENTICATED.withDescription("Missing or invalid token"), headers);
            return new ServerCall.Listener<>() {};
        }

        token = token.substring(7);

        try {
            Optional<Integer> userIdOptional = jwtUtil.getUserIdFromToken(token);
            if (userIdOptional.isEmpty()) {
                call.close(Status.UNAUTHENTICATED.withDescription("Invalid token"), headers);
                return new ServerCall.Listener<>() {};
            }

            Integer userId = userIdOptional.get();
            Context ctx = Context.current().withValue(USER_ID_CONTEXT_KEY, userId);
            return Contexts.interceptCall(ctx, call, headers, next);
        } catch (JWTVerificationException e) {
            call.close(Status.UNAUTHENTICATED.withDescription("Invalid token").withCause(e), headers);
            return new ServerCall.Listener<>() {};
        }
    }
}
