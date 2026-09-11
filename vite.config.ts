import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      'import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
