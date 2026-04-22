import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { logout } from '@/redux/auth/actions';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';
import { notification } from 'antd';

const ErpApp = lazy(() => import('./ErpApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

// Attempt to decode the JWT's exp claim without any library.
// Returns true (treat as expired) on any decode failure so that malformed
// or missing tokens are handled the same way as a genuine expiry.
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // 30-second skew buffer to absorb minor clock drift between browser and server.
    return payload.exp * 1000 < Date.now() - 30000;
  } catch {
    return true;
  }
}

export default function IdurarOs() {
  const dispatch = useDispatch();
  const { isLoggedIn, current } = useSelector(selectAuth);

  // // Online state
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   // Update network status
  //   const handleStatusChange = () => {
  //     setIsOnline(navigator.onLine);
  //     if (!isOnline) {
  //       console.log('🚀 ~ useEffect ~ navigator.onLine:', navigator.onLine);
  //       notification.config({
  //         duration: 20,
  //         maxCount: 1,
  //       });
  //       // Code to execute when there is internet connection
  //       notification.error({
  //         message: 'No internet connection',
  //         description: 'Cannot connect to the Internet, Check your internet network',
  //       });
  //     }
  //   };

  //   // Listen to the online status
  //   window.addEventListener('online', handleStatusChange);

  //   // Listen to the offline status
  //   window.addEventListener('offline', handleStatusChange);

  //   // Specify how to clean up after this effect for performance improvment
  //   return () => {
  //     window.removeEventListener('online', handleStatusChange);
  //     window.removeEventListener('offline', handleStatusChange);
  //   };
  // }, [navigator.onLine]);

  // Synchronous per-render check — evaluated before the render decision so
  // the protected UI never flashes when the stored token is already stale.
  // This is a UX guard only; the server's 401 remains the security boundary.
  const tokenIsExpired = useMemo(() => {
    if (!isLoggedIn) return false;
    const token = current?.token;
    if (!token) return true;
    return isTokenExpired(token);
  }, [isLoggedIn, current]);

  // Dispatch the existing logout action to clean up Redux state and
  // localStorage whenever we detect a stale token at render time.
  useEffect(() => {
    if (isLoggedIn && tokenIsExpired) {
      dispatch(logout());
    }
  }, [isLoggedIn, tokenIsExpired, dispatch]);

  console.log('Rendering:', isLoggedIn && !tokenIsExpired ? 'DefaultApp' : 'AuthRouter');

  if (!isLoggedIn || tokenIsExpired) {
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  }
  return <DefaultApp />;
}
