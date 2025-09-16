
import './style/app.css';
import MarkerIoWidget from '@/components/MarkerIoWidget/MarkerIoWidget';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const IdurarOs = lazy(() => import('./apps/IdurarOs'));

export default function RoutApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <MarkerIoWidget />
        <Suspense fallback={<PageLoader />}>
          <IdurarOs />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
