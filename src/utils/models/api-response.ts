export type ApiResponse<T = any> = {
  success: boolean;
  data?: T | null;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
  };
  statusCode?: number;
};

export class ApiResponseFormatter {
  static success<T>(
    data: T,
    message: string = 'Operación exitosa',
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(
    errors?: string[],
    message: string = 'Ocurrio un error',
    statusCode?: number,
  ): ApiResponse {
    return {
      success: false,
      message,
      errors,
      metadata: {
        timestamp: new Date().toISOString(),
      },
      statusCode,
    };
  }
}
