import { useState, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { showError } = useNotifications();

  const execute = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      let errorMessage = 'An error occurred';
      let errorTitle = 'Error';

      if (err instanceof Error) {
        // Check if it's a network error
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message.includes('404')) {
          errorTitle = 'Not Found';
          errorMessage = 'The requested resource was not found.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have permission to perform this action.';
        } else if (err.message.includes('500')) {
          errorTitle = 'Server Error';
          errorMessage = 'The server encountered an error. Please try again later.';
        } else if (err.message.includes('400')) {
          errorTitle = 'Invalid Request';
          errorMessage = 'The request was invalid. Please check your input and try again.';
        } else {
          errorMessage = err.message;
        }
      }

      showError(errorTitle, errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  return { execute, loading };
};