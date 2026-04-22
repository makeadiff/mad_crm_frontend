import axios from 'axios';
import { notification } from 'antd';
import codeMessage from './codeMessage';
import { API_BASE_URL } from '@/config/serverApiConfig';

// One-shot flag: once we start the logout redirect, all subsequent
// failed requests (e.g. concurrent calls) are silently dropped so the
// user never sees multiple "Session expired" toasts or redundant redirects.
let isLoggingOut = false;

const errorHandler = (error) => {
  if (!navigator.onLine) {
    notification.config({
      duration: 15,
      maxCount: 1,
    });
    notification.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const { response } = error;

  // No HTTP response at all — network error, connection reset, etc.
  // This check intentionally stays BEFORE the jwtExpired check: if there
  // is no response object there can be no jwtExpired flag either.
  if (!response) {
    notification.config({
      duration: 20,
      maxCount: 1,
    });
    notification.error({
      message: 'Problem connecting to server',
      description: 'Cannot connect to the server, Try again later',
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  if (response && response.data && response.data.jwtExpired) {
    // Guard: only the first caller proceeds; every concurrent 401 after
    // that is silently swallowed.
    if (isLoggingOut) return;
    isLoggingOut = true;

    notification.warning({
      message: 'Session expired',
      description: 'Please log in again.',
    });

    // Best-effort server-side session revocation.  3-second hard timeout —
    // if the backend is unreachable we still proceed with the local logout.
    axios
      .post(
        `${API_BASE_URL}logout?timestamp=${new Date().getTime()}`,
        {},
        { timeout: 3000, withCredentials: true }
      )
      .catch(() => {});

    // Mirror exactly what redux/auth/actions.js logout() clears.
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('settings');
    window.localStorage.setItem('isLogout', JSON.stringify({ isLogout: true }));

    window.location.href = '/logout';
    return; // critical — must NOT fall through to the status-code block below
  }

  if (response && response.status) {
    const message = response.data && response.data.message;

    const errorText = message || codeMessage[response.status];
    const { status, error } = response;
    notification.config({
      duration: 20,
      maxCount: 2,
    });
    notification.error({
      message: `Request error ${status}`,
      description: errorText,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('isLogout');
      window.location.href = '/logout';
    } else return response.data;
  } else {
    notification.config({
      duration: 15,
      maxCount: 1,
    });

    if (navigator.onLine) {
      // Code to execute when there is internet connection
      notification.error({
        message: 'Problem connecting to server',
        description: 'Cannot connect to the server, Try again later',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Contact your Account administrator',
      };
    } else {
      // Code to execute when there is no internet connection
      notification.error({
        message: 'No internet connection',
        description: 'Cannot connect to the Internet, Check your internet network',
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Check your internet network',
      };
    }
  }
};

export default errorHandler;
