// Public build-time configuration. No local host or private paths belong in browser source.
export const apiBaseUrl=(import.meta.env.VITE_API_BASE_URL??'').trim().replace(/\/+$/,'');
export const modelApiEnabled=import.meta.env.DEV || Boolean(apiBaseUrl);
export function apiUrl(path:string):string{
 if(apiBaseUrl)return apiBaseUrl+path;
 if(import.meta.env.DEV)return '/api'+path;
 throw new Error('The hosted Python API is not configured.');
}

