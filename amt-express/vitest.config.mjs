import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Configuration de base
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    env: {
      NODE_ENV: 'test',
    },
    
    // Répertoire des tests
    include: ['test/**/*.test.ts', 'test/**/*.test.tsx', '.test/**/*.test.ts'],
    
    // Configuration pour Next.js
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/content': path.resolve(__dirname, './content'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/context': path.resolve(__dirname, './context'),
      '@/services': path.resolve(__dirname, './services'),
      '@/utils': path.resolve(__dirname, './utils'),
    },
    
   // Mock Next.js specific modules (sera géré par le setup file)
    
    // Coverage (optionnel)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts', 'lib/**/*.tsx', 'utils/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
    },
    
    // Setup files
    setupFiles: ['test/setup.ts'],
    
    // Timeout pour les tests asynchrones
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Formattage de la sortie
    chaiConfig: {
      truncateThreshold: 0,
    },
    
    // Filtre les logs de console
    silent: false,
    
    // Ne pas échouer sur les erreurs de console
    consoleError: false,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/content': path.resolve(__dirname, './content'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app'),
      '@/context': path.resolve(__dirname, './context'),
      '@/services': path.resolve(__dirname, './services'),
      '@/utils': path.resolve(__dirname, './utils'),
    },
  },
});
