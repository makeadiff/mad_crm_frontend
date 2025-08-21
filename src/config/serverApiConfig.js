export const API_BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER}api/`;
export const BASE_URL = import.meta.env.VITE_BACKEND_SERVER;
export const DOWNLOAD_BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER}download/`;
export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'http://localhost:3000/';
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;
export const ACCESS_TOKEN_NAME = 'x-auth-token';

console.log('🔧 VITE_BACKEND_SERVER:', import.meta.env.VITE_BACKEND_SERVER);

