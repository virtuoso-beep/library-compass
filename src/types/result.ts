// Result type for operations (Railway-oriented programming)
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Type guard for error result
export function isError<T>(result: Result<T>): result is { success: false; error: Error } {
  return !result.success;
}

// Type guard for success result
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}
