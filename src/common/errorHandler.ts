import { AxiosError } from "axios";

/**
 * Extracts error messages from API responses
 * @param error - The error object from the API response
 * @returns The error message for further handling
 */
export const errorHandler = (error: any): string => {
  if (!error) {
    return "An unknown error occurred";
  }

  // Handle Axios errors
  if (error.isAxiosError) {
    const axiosError = error as AxiosError<any>;

    // Get error message from response if available
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "An error occurred"
    );
  }

  // Handle regular errors
  return error.message || "An error occurred";
};
