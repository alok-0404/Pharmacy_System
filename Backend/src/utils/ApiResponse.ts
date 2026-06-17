export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiResponse {
  static success<T>(message: string, data?: T): ApiResponseBody<T> {
    return {
      success: true,
      message,
      ...(data !== undefined && { data }),
    };
  }

  static error(message: string): ApiResponseBody {
    return {
      success: false,
      message,
    };
  }
}
