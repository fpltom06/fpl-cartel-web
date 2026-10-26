import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// Development fallback only; configured clients use VITE_API_BASE_URL directly.
const proxy={'/api':{target:'http://127.0.0.1:8000',changeOrigin:true,rewrite:(path:string)=>path.replace(/^\/api/,'')}};
export default defineConfig({plugins:[react(),tailwindcss()],server:{proxy},preview:{proxy}});

