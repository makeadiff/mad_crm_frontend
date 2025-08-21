import { createRoot } from 'react-dom/client';

import RootApp from './RootApp';

console.log(
  `%c🚀 Starting in ${import.meta.env.VITE_ENV_LABEL} environment`,
  'color: green; font-weight: bold;'
);
console.log('🌐 API Base URL:', import.meta.env.VITE_BACKEND_SERVER);
console.log('📁 File Base URL:', import.meta.env.VITE_FILE_BASE_URL);



const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);
