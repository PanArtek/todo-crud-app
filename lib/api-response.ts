import { NextResponse } from "next/server";

/**
 * Standard API response format (from PRD)
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error codes used across the API
 */
export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return NextResponse.json(response, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code: ErrorCode,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  notFound: (resource: string = "Resource") =>
    errorResponse(`${resource} not found`, ErrorCodes.NOT_FOUND, 404),

  unauthorized: () =>
    errorResponse("Authentication required", ErrorCodes.UNAUTHORIZED, 401),

  forbidden: () =>
    errorResponse("Insufficient permissions", ErrorCodes.FORBIDDEN, 403),

  badRequest: (message: string) =>
    errorResponse(message, ErrorCodes.BAD_REQUEST, 400),

  validationError: (message: string) =>
    errorResponse(message, ErrorCodes.VALIDATION_ERROR, 422),

  conflict: (message: string) =>
    errorResponse(message, ErrorCodes.CONFLICT, 409),

  internal: (message: string = "Internal server error") =>
    errorResponse(message, ErrorCodes.INTERNAL_ERROR, 500),

  notImplemented: () =>
    errorResponse("Not implemented", ErrorCodes.NOT_IMPLEMENTED, 501),
};

/**
 * Placeholder response for routes under development
 */
export function notImplementedResponse(): NextResponse<ApiSuccessResponse<null>> {
  return NextResponse.json(
    {
      success: true,
      data: null,
      message: "Not implemented",
    },
    { status: 501 }
  );
}
